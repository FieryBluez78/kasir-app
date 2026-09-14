"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/lib/session-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { session } = useSession();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (session.role === "CASHIER") {
      return ["/dashboard", "/pos", "/products", "/transactions"].includes(item.href);
    }
    return true;
  });

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Store className="h-4 w-4" />
        </div>
        <span className="font-display text-sm font-semibold">Toko Kasir</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
        {visibleItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
