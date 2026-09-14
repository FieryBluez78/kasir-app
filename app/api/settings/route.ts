import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { storeSettingsSchema } from "@/lib/validations/settings";
import { requirePermission, requireSession } from "@/lib/auth/guard";

export async function GET() {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const guard = await requirePermission("settings:update");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = storeSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  return NextResponse.json(settings);
}
