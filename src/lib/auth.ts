import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone }) => {
        // TODO: configure a real SMS provider (e.g., Twilio, AWS SNS)
        // For development: OTP is logged to the console
        console.log(`[AUTH] OTP for ${phone}`);
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "userTable",
    fields: {
      name: "firstName",
      image: "imageUrl",
    },
    additionalFields: {
      lastName: {
        type: "string",
        required: true,
        input: true,
      },
      condominiumId: {
        type: "string",
        required: true,
        input: true,
      },
      apartmentId: {
        type: "string",
        required: true,
        input: true,
      },
      cpf: {
        type: "string",
        required: true,
        input: true,
      },
      rg: {
        type: "string",
        required: true,
        input: true,
      },
      birthDate: {
        type: "string",
        required: true,
        input: true,
      },
      responsibleId: {
        type: "string",
        required: false,
        input: true,
      },
      phoneNumber: {
        type: "string",
        required: true,
        input: true,
      },
      role: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "accountTable",
  },
  verification: {
    modelName: "verificationTable",
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
