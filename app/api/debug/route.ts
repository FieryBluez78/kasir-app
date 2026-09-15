import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// TEMPORARY — delete this file once login is confirmed working.
// Reveals no passwords, only enough to diagnose which database this
// deployment is actually connected to and whether it has any users.
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({ select: { email: true, role: true } });

    const dbUrl = process.env.DATABASE_URL ?? "";
    const hostMatch = dbUrl.match(/@([^/]+)\//);

    return NextResponse.json({
      userCount,
      users,
      databaseHost: hostMatch ? hostMatch[1] : "COULD_NOT_PARSE_DATABASE_URL",
      authSecretIsSet: Boolean(process.env.AUTH_SECRET),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "DB_CONNECTION_FAILED", message: String(err) },
      { status: 500 }
    );
  }
}