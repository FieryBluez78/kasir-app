"use client";

import { useState } from "react";
import { ProductPicker } from "@/components/pos/product-picker";
import { CartPanel } from "@/components/pos/cart-panel";
import { useCart } from "@/lib/hooks/use-cart";

export default function PosPage() {
  const cart = useCart();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:h-[calc(100vh-7rem)] lg:grid-cols-[1fr_380px]">
      <div key={refreshKey} className="min-h-0 rounded-lg border border-border bg-card p-4">
        <ProductPicker onSelect={cart.addProduct} />
      </div>
      <div className="min-h-0 rounded-lg border border-border bg-card p-4">
        <CartPanel cart={cart} onCheckoutComplete={() => setRefreshKey((k) => k + 1)} />
      </div>
    </div>
  );
}
