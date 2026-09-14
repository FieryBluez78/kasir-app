"use client";

import { useState } from "react";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { AccountDialog } from "@/components/auth/account-dialog";
import { useSession } from "@/lib/session-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, UserCog } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

export function Topbar({ title }: { title: string }) {
  const { session, logout } = useSession();
  const { t } = useLanguage();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur md:px-6">
      <h1 className="font-display text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{session.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {t("auth.loggedInAs")}: {session.role === "ADMIN" ? "Admin" : "Kasir"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setAccountOpen(true)}>
              <UserCog className="h-4 w-4" />
              {t("auth.myAccount")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4" />
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </header>
  );
}