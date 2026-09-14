import { prisma } from "@/lib/db/prisma";
import { startOfMonth, startOfToday, startOfWeek } from "@/lib/utils/date";

export async function getRevenueSummary() {
  const [today, week, month, totalTxToday] = await Promise.all([
    sumRevenueSince(startOfToday()),
    sumRevenueSince(startOfWeek()),
    sumRevenueSince(startOfMonth()),
    prisma.transaction.count({
      where: { createdAt: { gte: startOfToday() }, status: "COMPLETED" },
    }),
  ]);

  return { today, week, month, totalTxToday };
}

async function sumRevenueSince(date: Date) {
  const result = await prisma.transaction.aggregate({
    where: { createdAt: { gte: date }, status: "COMPLETED" },
    _sum: { total: true },
    _count: true,
  });
  return { total: result._sum.total ?? 0, count: result._count };
}

export async function getGrossProfit(since: Date) {
  const items = await prisma.transactionItem.findMany({
    where: { transaction: { createdAt: { gte: since }, status: "COMPLETED" } },
    select: { subtotal: true, unitCost: true, quantity: true },
  });

  const revenue = items.reduce((sum, i) => sum + i.subtotal, 0);
  const cost = items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);
  return { revenue, cost, grossProfit: revenue - cost };
}

export async function getTopProducts(limit = 5, since?: Date) {
  const grouped = await prisma.transactionItem.groupBy({
    by: ["productId", "productName"],
    where: since ? { transaction: { createdAt: { gte: since }, status: "COMPLETED" } } : { transaction: { status: "COMPLETED" } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({
    productId: g.productId,
    productName: g.productName,
    quantitySold: g._sum.quantity ?? 0,
    revenue: g._sum.subtotal ?? 0,
  }));
}

export async function getDashboardStats() {
  const [totalProducts, totalStockAgg, outOfStockCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true, deletedAt: null } }),
    prisma.product.aggregate({
      where: { isActive: true, deletedAt: null },
      _sum: { stock: true },
    }),
    prisma.product.count({
      where: { isActive: true, deletedAt: null, stock: 0 },
    }),
  ]);

  // Re-derive low-stock precisely (stock > 0 AND stock <= minimumStock) since
  // Prisma/SQLite can't compare two columns in a `where` filter directly.
  const candidates = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null, stock: { gt: 0 } },
    select: { stock: true, minimumStock: true },
  });
  const preciseLowStock = candidates.filter((p) => p.stock <= p.minimumStock).length;

  return {
    totalProducts,
    totalStock: totalStockAgg._sum.stock ?? 0,
    lowStockCount: preciseLowStock,
    outOfStockCount,
  };
}
