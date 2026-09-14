export type Role = "ADMIN" | "CASHIER";

export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  categoryId: string | null;
  category: Category | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = "RESTOCK" | "ADJUSTMENT_ADD" | "ADJUSTMENT_REMOVE" | "SALE" | "INITIAL" | "RETURN";

export interface StockMovement {
  id: string;
  productId: string;
  product: { name: string; sku: string };
  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: string;
}

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  code: string;
  subtotal: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  total: number;
  payment: number;
  change: number;
  status: "COMPLETED" | "VOIDED";
  items: TransactionItem[];
  user: { name: string } | null;
  createdAt: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  currency: string;
  taxPercent: number;
}
