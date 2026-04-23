import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── Condominium tables ──────────────────────────────────────────────────────
export const condominiumTable = pgTable("condominium", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  address: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const condominiumRelations = relations(condominiumTable, ({ many }) => ({
  users: many(userTable),
  apartments: many(apartmentTable),
  rooms: many(roomTable),
  bookings: many(bookingTable),
}));

export const towersEnum = pgEnum("tower", ["1", "2"]);
export const apartmentBlockEnum = pgEnum("apartment_block", ["A", "B", "C"]);
export const apartmentTable = pgTable(
  "apartment",
  {
    id: uuid().primaryKey().defaultRandom(),
    condominiumId: uuid("condominium_id")
      .notNull()
      .references(() => condominiumTable.id),
    tower: towersEnum().notNull(),
    apartmentNumber: text("apartment_number").notNull(),
    apartmentBlock: apartmentBlockEnum("apartment_block").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueApartment: uniqueIndex("unique_apartment").on(
      table.condominiumId,
      table.tower,
      table.apartmentNumber,
      table.apartmentBlock,
    ),
  }),
);

export const apartmentRelations = relations(
  apartmentTable,
  ({ one, many }) => ({
    condominium: one(condominiumTable, {
      fields: [apartmentTable.condominiumId],
      references: [condominiumTable.id],
    }),
    users: many(userTable),
  }),
);

// ── User tables ──────────────────────────────────────────────────────
export const rolesEnum = pgEnum("role", ["admin", "resident"]);
export const userTable = pgTable("user", {
  id: uuid().primaryKey().defaultRandom(),
  condominiumId: uuid("condominium_id")
    .notNull()
    .references(() => condominiumTable.id),
  apartmentId: uuid("apartment_id")
    .notNull()
    .references(() => apartmentTable.id),
  responsibleId: uuid("responsible_id").references(
    (): AnyPgColumn => userTable.id,
  ),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
  rg: varchar("rg", { length: 20 }).notNull().unique(),
  birthDate: date("birth_date").notNull(),
  email: text().notNull().unique(),
  phoneNumber: text("phone_number").unique(),
  role: rolesEnum().notNull(),
  imageUrl: text("image_url"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneNumberVerified: boolean("phone_number_verified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRelations = relations(userTable, ({ one, many }) => ({
  booking: many(bookingTable),
  condominium: one(condominiumTable, {
    fields: [userTable.condominiumId],
    references: [condominiumTable.id],
  }),
  responsible: one(userTable, {
    fields: [userTable.responsibleId],
    references: [userTable.id],
  }),
  apartment: one(apartmentTable, {
    fields: [userTable.apartmentId],
    references: [apartmentTable.id],
  }),
}));

// ── Better-Auth tables ──────────────────────────────────────────────────────
export const sessionTable = pgTable(
  "session_table",
  {
    id: uuid().defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessionTable_userId_idx").on(table.userId)],
);

export const accountTable = pgTable(
  "account_table",
  {
    id: uuid().defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accountTable_userId_idx").on(table.userId)],
);

export const verificationTable = pgTable(
  "verification_table",
  {
    id: uuid().defaultRandom().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verificationTable_identifier_idx").on(table.identifier)],
);

export const userTableRelations = relations(userTable, ({ many }) => ({
  sessionTables: many(sessionTable),
  accountTables: many(accountTable),
}));

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
  userTable: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const accountTableRelations = relations(accountTable, ({ one }) => ({
  userTable: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

// ── Room tables ──────────────────────────────────────────────────────
export const floorEnum = pgEnum("floor", ["1", "2", "3", "4", "5", "28"]);
export const roomTable = pgTable(
  "room",
  {
    id: uuid().primaryKey().defaultRandom(),
    condominiumId: uuid("condominium_id")
      .notNull()
      .references(() => condominiumTable.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categoryTable.id, { onDelete: "set null" }),
    slug: text().notNull().unique(),
    name: text().notNull(),
    description: text().notNull(),
    imageUrl: text("image_url").notNull(),
    priceInCents: integer("price_in_cents").notNull().default(0),
    openingTime: time("opening_time").notNull(),
    closingTime: time("closing_time").notNull(),
    availableWeekDays: jsonb("available_week_days")
      .$type<number[]>()
      .notNull()
      .default([0, 1, 2, 3, 4, 5, 6]),
    minorAloneAllowed: boolean("minor_alone_allowed").notNull().default(false),
    minAge: integer("min_age"),
    floor: floorEnum().notNull(),
    maxCapacity: integer("max_capacity").notNull(),
    maxOverlaps: integer("max_overlaps").notNull().default(0),
    dayUse: boolean("day_use").notNull().default(false),
    maxBookingsDailyLimit: integer("max_bookings_daily_limit")
      .notNull()
      .default(1),
    maxBookingsWeeklyLimit: integer("max_bookings_weekly_limit")
      .notNull()
      .default(1),
    maxBookingsMonthlyLimit: integer("max_bookings_monthly_limit")
      .notNull()
      .default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueSlug: uniqueIndex("unique_slug").on(table.condominiumId, table.slug),
  }),
);

export const roomRelations = relations(roomTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [roomTable.categoryId],
    references: [categoryTable.id],
  }),
  booking: many(bookingTable),
  rules: many(roomRulesTable),
  items: many(roomItemsTable),
  condominium: one(condominiumTable, {
    fields: [roomTable.condominiumId],
    references: [condominiumTable.id],
  }),
}));

export const roomRulesTable = pgTable("room_rules", {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => roomTable.id),
  rule: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const roomRulesRelations = relations(roomRulesTable, ({ one }) => ({
  room: one(roomTable, {
    fields: [roomRulesTable.roomId],
    references: [roomTable.id],
  }),
}));

export const roomItemsTable = pgTable("room_items", {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => roomTable.id),
  item: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const roomItemsRelations = relations(roomItemsTable, ({ one }) => ({
  room: one(roomTable, {
    fields: [roomItemsTable.roomId],
    references: [roomTable.id],
  }),
}));

export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(roomTable),
}));

// ── Booking tables ──────────────────────────────────────────────────────
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "active",
  "completed",
  "cancelled",
]);
export const bookingTable = pgTable(
  "booking",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
    roomId: uuid("room_id")
      .notNull()
      .references(() => roomTable.id),
    condominiumId: uuid("condominium_id")
      .notNull()
      .references(() => condominiumTable.id),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: bookingStatusEnum().notNull().default("pending"),
    cancelledAt: timestamp("cancelled_at"),
    cancelledBy: uuid("cancelled_by").references(() => userTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    validInterval: check(
      "valid_interval",
      sql`${table.startDate} < ${table.endDate}`,
    ),
  }),
);

export const bookingRelations = relations(bookingTable, ({ one }) => ({
  user: one(userTable, {
    fields: [bookingTable.userId],
    references: [userTable.id],
  }),
  room: one(roomTable, {
    fields: [bookingTable.roomId],
    references: [roomTable.id],
  }),
  condominium: one(condominiumTable, {
    fields: [bookingTable.condominiumId],
    references: [condominiumTable.id],
  }),
}));
