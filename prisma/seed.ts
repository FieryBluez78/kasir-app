import { PrismaClient } from "@prisma/client";
import { checkout } from "../lib/services/checkout";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.transactionItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.user.deleteMany();

  await prisma.storeSettings.create({
    data: {
      id: "singleton",
      storeName: "Toko Berkah Jaya",
      address: "Jl. Merdeka No. 12, Kediri, Jawa Timur",
      phone: "0812-3456-7890",
      currency: "IDR",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@tokoberkah.id",
      role: "ADMIN",
      passwordHash: hashPassword("admin123"),
    },
  });
  await prisma.user.create({
    data: {
      name: "Kasir",
      email: "kasir@tokoberkah.id",
      role: "CASHIER",
      passwordHash: hashPassword("kasir123"),
    },
  });

  const [makanan, minuman, snack, atk] = await Promise.all([
    prisma.category.create({ data: { name: "Makanan" } }),
    prisma.category.create({ data: { name: "Minuman" } }),
    prisma.category.create({ data: { name: "Snack" } }),
    prisma.category.create({ data: { name: "ATK" } }),
  ]);

  const productSeeds = [
    {
      sku: "FOOD-001",
      name: "Indomie Goreng",
      categoryId: makanan.id,
      costPrice: 2800,
      sellingPrice: 3500,
      stock: 120,
      minimumStock: 20,
      description: "Mi instan goreng favorit, satu bungkus.",
    },
    {
      sku: "FOOD-002",
      name: "Beras Premium 5kg",
      categoryId: makanan.id,
      costPrice: 62000,
      sellingPrice: 69000,
      stock: 15,
      minimumStock: 5,
      description: "Beras putih pulen kemasan 5kg.",
    },
    {
      sku: "DRINK-001",
      name: "Aqua 600ml",
      categoryId: minuman.id,
      costPrice: 3000,
      sellingPrice: 4000,
      stock: 8,
      minimumStock: 10,
      description: "Air mineral kemasan botol 600ml.",
    },
    {
      sku: "DRINK-002",
      name: "Teh Botol Sosro",
      categoryId: minuman.id,
      costPrice: 3800,
      sellingPrice: 5000,
      stock: 40,
      minimumStock: 10,
      description: "Teh manis dalam kemasan botol.",
    },
    {
      sku: "SNACK-001",
      name: "Chitato Sapi Panggang",
      categoryId: snack.id,
      costPrice: 8500,
      sellingPrice: 11000,
      stock: 0,
      minimumStock: 8,
      description: "Keripik kentang rasa sapi panggang.",
    },
    {
      sku: "SNACK-002",
      name: "Kopiko Kopi Kemasan",
      categoryId: snack.id,
      costPrice: 900,
      sellingPrice: 1500,
      stock: 200,
      minimumStock: 30,
      description: "Permen kopi klasik.",
    },
    {
      sku: "ATK-001",
      name: "Pulpen Standard AE7",
      categoryId: atk.id,
      costPrice: 1800,
      sellingPrice: 2500,
      stock: 60,
      minimumStock: 15,
      description: "Pulpen tinta hitam standar.",
    },
    {
      sku: "ATK-002",
      name: "Buku Tulis 38 Lembar",
      categoryId: atk.id,
      costPrice: 2500,
      sellingPrice: 3500,
      stock: 4,
      minimumStock: 10,
      description: "Buku tulis sekolah isi 38 lembar.",
    },
  ];

  const products = [];
  for (const p of productSeeds) {
    const product = await prisma.product.create({ data: p });
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: "INITIAL",
        quantity: product.stock,
        stockBefore: 0,
        stockAfter: product.stock,
        reason: "Initial stock on product creation",
        userId: admin.id,
      },
    });
    products.push(product);
  }

  console.log("Creating demo transactions...");

  const demoCarts = [
    [{ productId: products[0].id, quantity: 3 }, { productId: products[3].id, quantity: 2 }],
    [{ productId: products[5].id, quantity: 5 }],
    [{ productId: products[6].id, quantity: 2 }, { productId: products[1].id, quantity: 1 }],
    [{ productId: products[3].id, quantity: 4 }],
  ];

  for (const cart of demoCarts) {
    const subtotal = cart.reduce((sum, item) => {
      const p = products.find((pr) => pr.id === item.productId)!;
      return sum + p.sellingPrice * item.quantity;
    }, 0);
    await checkout({
      items: cart,
      discountType: null,
      discountValue: null,
      payment: Math.ceil((subtotal + 5000) / 5000) * 5000,
      userId: admin.id,
    });
  }

  console.log("Seed complete.");
  console.log("Demo login — Admin: admin@tokoberkah.id / admin123");
  console.log("Demo login — Cashier: kasir@tokoberkah.id / kasir123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
