import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getGrossProfit, getTopProducts } from "@/lib/services/revenue";
import { requirePermission } from "@/lib/auth/guard";

export async function GET(req: NextRequest) {
  const guard = await requirePermission("reports:view");
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(0);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  const [salesAgg, bestSelling, stockAgg, lowStockProducts, outOfStockProducts, movements, profit] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { createdAt: { gte: from, lte: to }, status: "COMPLETED" },
        _sum: { total: true, discountAmount: true },
        _count: true,
      }),
      getTopProducts(10, from),
      prisma.product.aggregate({ where: { deletedAt: null }, _sum: { stock: true } }),
      prisma.product.findMany({
        where: { deletedAt: null, stock: { gt: 0 } },
        select: { id: true, name: true, sku: true, stock: true, minimumStock: true },
      }),
      prisma.product.count({ where: { deletedAt: null, stock: 0 } }),
      prisma.stockMovement.groupBy({
        by: ["type"],
        where: { createdAt: { gte: from, lte: to } },
        _sum: { quantity: true },
      }),
      getGrossProfit(from),
    ]);

  const lowStock = lowStockProducts.filter((p) => p.stock <= p.minimumStock);

  return NextResponse.json({
    sales: {
      totalSales: salesAgg._sum.total ?? 0,
      totalDiscount: salesAgg._sum.discountAmount ?? 0,
      totalTransactions: salesAgg._count,
      bestSelling,
    },
    stock: {
      totalStock: stockAgg._sum.stock ?? 0,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStockProducts,
      lowStockItems: lowStock,
      movementSummary: movements.map((m) => ({ type: m.type, quantity: m._sum.quantity ?? 0 })),
    },
    revenue: {
      revenue: profit.revenue,
      cost: profit.cost,
      grossProfit: profit.grossProfit,
      totalDiscount: salesAgg._sum.discountAmount ?? 0,
    },
  });
}
