import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./session";
import { can, type Permission } from "./permissions";

/**
 * Use at the top of an API route handler:
 *
 *   const guard = await requirePermission("product:delete");
 *   if (guard instanceof NextResponse) return guard;
 *   const session = guard; // typed as SessionPayload from here on
 *
 * Returns 401 if there's no valid session cookie at all, 403 if the session
 * is valid but the role lacks the permission. This is what actually enforces
 * Admin vs Cashier server-side — the client-side nav filtering and disabled
 * buttons are just UX; this is what stops a Cashier from calling the API
 * directly (e.g. via curl or devtools) to delete a product.
 */
export async function requirePermission(
  permission: Permission
): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (!can(session.role, permission)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return session;
}

/** Same as above but only checks that *some* valid session exists. */
export async function requireSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return session;
}
