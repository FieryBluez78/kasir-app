import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/pos", key: "nav.pos", icon: ShoppingCart },
  { href: "/products", key: "nav.products", icon: Package },
  { href: "/inventory", key: "nav.inventory", icon: Boxes },
  { href: "/transactions", key: "nav.transactions", icon: Receipt },
  { href: "/revenue", key: "nav.revenue", icon: Wallet },
  { href: "/reports", key: "nav.reports", icon: BarChart3 },
  { href: "/settings", key: "nav.settings", icon: Settings },
] as const;
