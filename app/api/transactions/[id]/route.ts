import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/guard";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: { items: true, user: { select: { name: true } } },
  });
  if (!transaction) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(transaction);
}
