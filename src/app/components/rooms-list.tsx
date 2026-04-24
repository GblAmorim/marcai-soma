"use client";

import { SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Room } from "@/lib/rooms";
import { parseHour } from "@/lib/slots";
import { cn } from "@/lib/utils";

import RoomCard from "./room-card";

interface RoomsListProps {
  rooms: Room[];
}

function isRoomOpenNow(room: Room): boolean {
  const hour = new Date().getHours();
  const openHour = parseHour(room.openingTime);
  const closeHour = parseHour(room.closingTime);
  return hour >= openHour && hour < closeHour;
}

const RoomsList = ({ rooms }: RoomsListProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );

  const hasActiveFilters =
    search !== "" || activeCategory !== "Todos" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("Todos");
    setStatusFilter("all");
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rooms.map((r) => r.category.name)));
    return ["Todos", ...unique];
  }, [rooms]);

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      const matchesName = room.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "Todos" || room.category.name === activeCategory;

      const open = isRoomOpenNow(room);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && open) ||
        (statusFilter === "closed" && !open);

      return matchesName && matchesCategory && matchesStatus;
    });
  }, [rooms, search, activeCategory, statusFilter]);

  return (
    <div className="flex flex-col gap-5">
      {/* Search + clear */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar espaço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpar busca
          </Button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:border-primary/50 hover:bg-accent",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "all" | "open" | "closed")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            Todos
          </TabsTrigger>
          <TabsTrigger value="open" className="flex-1">
            Abertos agora
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex-1">
            Fechados
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard key={room.slug} {...room} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Nenhum espaço encontrado com os filtros selecionados.
        </p>
      )}
    </div>
  );
};

export default RoomsList;
