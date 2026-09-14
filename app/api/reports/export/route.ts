import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatDateShort } from "@/lib/utils/date";
import { requirePermission } from "@/lib/auth/guard";

function toCsvRow(values: (string | number)[]): string {
  return values
    .map((v) => {
      const str = String(v);
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    })
    .join(",");
}

export async function GET(req: NextRequest) {
  const guard = await requirePermission("reports:view");
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(0);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: from, lte: to }, status: "COMPLETED" },
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });

  const rows = [
    toCsvRow(["Transaction ID", "Date", "Subtotal", "Discount", "Total", "Payment", "Change", "Items"]),
    ...transactions.map((t) =>
      toCsvRow([
        t.code,
        formatDateShort(t.createdAt),
        t.subtotal,
        t.discountAmount,
        t.total,
        t.payment,
        t.change,
        t.items.map((i) => `${i.productName} x${i.quantity}`).join("; "),
      ])
    ),
  ];

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-report-${Date.now()}.csv"`,
    },
  });
}
