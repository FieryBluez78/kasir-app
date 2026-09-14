"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Receipt, Menu } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useState } from "react";
import { NAV_ITEMS } from "./nav-items";
import { useSession } from "@/lib/session-provider";
import { Sheet } from "./sheet";

const PRIMARY_MOBILE_ITEMS = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/pos", key: "nav.pos", icon: ShoppingCart },
  { href: "/products", key: "nav.products", icon: Package },
  { href: "/transactions", key: "nav.transactions", icon: Receipt },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (session.role === "CASHIER") {
      return ["/dashboard", "/pos", "/products", "/transactions"].includes(item.href);
    }
    return true;
  });

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card py-1.5 md:hidden">
        {PRIMARY_MOBILE_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
          {t("common.all")}
        </button>
      </nav>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen} title={t("common.all")}>
        <div className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                  active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
