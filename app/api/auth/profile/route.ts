import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { accountUpdateSchema } from "@/lib/validations/account";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { requireSession } from "@/lib/auth/guard";

export async function PATCH(req: NextRequest) {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = accountUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: guard.userId } });
  if (!user || !user.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      ...(newPassword ? { passwordHash: hashPassword(newPassword) } : {}),
    },
  });

  // The session cookie snapshots name/email/role at login time, so if either
  // changed here, reissue it — otherwise the UI would keep showing stale
  // values until the next login.
  const token = createSessionToken({
    userId: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role as "ADMIN" | "CASHIER",
  });

  const res = NextResponse.json({ userId: updated.id, name: updated.name, email: updated.email, role: updated.role });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}