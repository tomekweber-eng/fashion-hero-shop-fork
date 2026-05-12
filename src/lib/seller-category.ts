import { products } from "@/data/products";
import type { PilotCategory } from "@/types/promoted-listings";

export function getSellerPilotCategory(sellerId: string): PilotCategory | null {
  const sellerProducts = products.filter((p) => p.sellerId === sellerId);
  if (sellerProducts.length === 0) return null;

  if (sellerProducts.some((p) => p.type === "bag")) return "bags";

  const shoesCount = sellerProducts.filter((p) => p.productCategory === "shoes").length;
  if (shoesCount / sellerProducts.length >= 0.5) return "shoes";

  return null;
}

export const PILOT_CATEGORY_LABEL: Record<PilotCategory, string> = {
  shoes: "Shoes",
  bags: "Bags",
};
