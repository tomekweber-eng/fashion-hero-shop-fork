"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useActiveSeller } from "@/hooks/use-active-seller";
import { getSellerPilotCategory, PILOT_CATEGORY_LABEL } from "@/lib/seller-category";
import { track, identifySeller } from "@/lib/analytics";

export function PromotedListingsBanner() {
  const { seller, hydrated } = useActiveSeller();
  const lastViewedKey = useRef<string | null>(null);

  const category = getSellerPilotCategory(seller.id);

  useEffect(() => {
    if (!hydrated || !category) return;
    const key = `${seller.id}:${category}`;
    if (lastViewedKey.current === key) return;
    lastViewedKey.current = key;
    identifySeller(seller.id, { seller_name: seller.name, seller_category: category });
    track("promoted_listings_banner_viewed", {
      sellerId: seller.id,
      sellerCategory: category,
    });
  }, [hydrated, seller.id, seller.name, category]);

  if (!hydrated || !category) return null;

  const onClick = () => {
    track("promoted_listings_banner_clicked", {
      sellerId: seller.id,
      sellerCategory: category,
    });
  };

  return (
    <Link
      href="/seller/promoted-listings"
      onClick={onClick}
      className="block rounded-xl bg-gradient-to-r from-charcoal to-charcoal-light p-6 text-white transition-opacity hover:opacity-95 md:p-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.6px]">
            New for {PILOT_CATEGORY_LABEL[category]} sellers
          </span>
          <h2 className="text-xl font-light leading-tight md:text-2xl">
            Sprzedajesz wiecej. Promoted Listings dla {seller.name}.
          </h2>
          <p className="max-w-xl text-[13px] text-white/80">
            Wybierz pakiet platnej promocji i wystrzel swoje produkty na top kategorii {PILOT_CATEGORY_LABEL[category]}.
          </p>
        </div>
        <span className="btn-cta self-start md:self-center">
          Sprawdz pakiety
        </span>
      </div>
    </Link>
  );
}
