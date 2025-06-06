"use client";
import { useCart } from "@/context/CartContext"; // ✅ adjust this path as needed
import { Button } from "@/components/ui/button"; // ✅ adjust if needed

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();

  return (
    <Button onClick={() => addItem(product)} className="w-full">
      Add to Cart
    </Button>
  );
}
