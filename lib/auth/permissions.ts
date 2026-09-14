import type { Role } from "@/types";

export type Permission =
  | "product:create"
  | "product:update"
  | "product:delete"
  | "category:manage"
  | "stock:adjust"
  | "transaction:create"
  | "transaction:void"
  | "settings:update"
  | "reports:view";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "product:create",
    "product:update",
    "product:delete",
    "category:manage",
    "stock:adjust",
    "transaction:create",
    "transaction:void",
    "settings:update",
    "reports:view",
  ],
  CASHIER: ["transaction:create"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Server-side guard for API routes / server actions. Throws so callers can
 * let it bubble into a 403 response. Real auth should resolve `role` from
 * the actual session instead of a request header once wired up.
 */
export function assertPermission(role: Role, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error(`FORBIDDEN: role ${role} lacks permission ${permission}`);
  }
}
