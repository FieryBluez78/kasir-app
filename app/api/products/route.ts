import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { productSchema } from "@/lib/validations/product";
import { recordStockMovement } from "@/lib/services/stock";
import { requirePermission, requireSession } from "@/lib/auth/guard";

export async function GET(req: NextRequest) {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const categoryId = searchParams.get("categoryId");
  const stockStatus = searchParams.get("stockStatus"); // "in" | "low" | "out"
  const sort = searchParams.get("sort") ?? "name-asc";

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
          ],
        }
      : {}),
    ...(categoryId && categoryId !== "all" ? { categoryId } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "name-desc"
      ? { name: "desc" }
      : sort === "price-asc"
      ? { sellingPrice: "asc" }
      : sort === "price-desc"
      ? { sellingPrice: "desc" }
      : sort === "stock-desc"
      ? { stock: "desc" }
      : sort === "stock-asc"
      ? { stock: "asc" }
      : { name: "asc" };

  let products = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  // Stock-status filtering needs the two-column comparison Prisma can't do in `where`.
  if (stockStatus === "out") products = products.filter((p) => p.stock === 0);
  if (stockStatus === "low") products = products.filter((p) => p.stock > 0 && p.stock <= p.minimumStock);
  if (stockStatus === "in") products = products.filter((p) => p.stock > p.minimumStock);

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const guard = await requirePermission("product:create");
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existingSku = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existingSku) {
    return NextResponse.json({ error: "DUPLICATE_SKU" }, { status: 409 });
  }

  const { stock, ...rest } = parsed.data;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: { ...rest, categoryId: rest.categoryId || null, stock: 0 },
    });
    if (stock > 0) {
      await recordStockMovement({
        tx,
        productId: created.id,
        type: "INITIAL",
        delta: stock,
        reason: "Initial stock on product creation",
        userId: guard.userId,
      });
    }
    return tx.product.findUniqueOrThrow({ where: { id: created.id }, include: { category: true } });
  });

  return NextResponse.json(product, { status: 201 });
}
