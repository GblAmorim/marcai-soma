"use client";

import {
  CalendarIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export const Header = () => {
  const { data: session } = authClient.useSession();
  const user = session?.user as
    | (NonNullable<typeof session>["user"] & { role?: string })
    | undefined;
  const isAdmin = user?.role === "admin";
  return (
    <header className="flex items-center justify-between p-5">
      <Link href="/">
        <Image src="/logo.svg" alt="Marcai" width={100} height={26.14} />
      </Link>

      <div className="item-center flex gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-5">
              {session?.user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={session?.user?.image as string | undefined}
                        />
                        <AvatarFallback>
                          {session?.user?.name?.split(" ")[0][0]}
                          {session?.user?.name?.split(" ")[1]?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold">{session?.user?.name}</h3>
                        <span className="text-muted-foregound block text-xs">
                          {session?.user?.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => authClient.signOut()}
                    >
                      <LogOutIcon />
                    </Button>
                  </div>

                  <nav className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start gap-2"
                      asChild
                    >
                      <Link href="/profile">
                        <UserIcon className="h-4 w-4" />
                        Meu perfil
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-2"
                      asChild
                    >
                      <Link href="/bookings">
                        <CalendarIcon className="h-4 w-4" />
                        Minhas reservas
                      </Link>
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          asChild
                        >
                          <Link href="/admin/rooms">
                            <SettingsIcon className="h-4 w-4" />
                            Gerenciar salas
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          asChild
                        >
                          <Link href="/admin/bookings">
                            <CalendarIcon className="h-4 w-4" />
                            Histórico de reservas
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          asChild
                        >
                          <Link href="/admin/residents">
                            <UsersIcon className="h-4 w-4" />
                            Banco da verdade
                          </Link>
                        </Button>
                      </>
                    )}
                  </nav>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Olá, faça seu login!</h2>
                  <Button size="icon" asChild variant="outline">
                    <Link href="/authentication">
                      <LogInIcon />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
