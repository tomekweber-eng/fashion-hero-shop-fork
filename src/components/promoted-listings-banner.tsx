"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useActiveSeller } from "@/hooks/use-active-seller";
import { getSellerPilotCategory, PILOT_CATEGORY_LABEL } from "@/lib/seller-category";
import { track, identifySeller } from "@/lib/analytics";
import { StarIcon } from "@/components/icons";

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

  const categoryLabel = PILOT_CATEGORY_LABEL[category];

  return (
    <Link
      href="/seller/promoted-listings"
      onClick={onClick}
      className="group relative block overflow-hidden rounded-2xl bg-charcoal text-white transition-shadow hover:shadow-xl"
    >
      {/* decorative glow */}
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl transition-all group-hover:bg-amber-200/30" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Nowe · Pilot dla {categoryLabel}
          </span>
          <h2 className="text-2xl font-light leading-tight md:text-3xl">
            Chcesz zarabiać <span className="italic">3x więcej</span> w kategorii {categoryLabel}?
          </h2>
          <p className="text-[13px] text-white/75 md:text-[14px]">
            Promoted Listings wystrzeli {seller.name} na pierwsze miejsca kategorii i karuzelę na stronie głównej Fashion Hero. Zacznij już od 49 PLN/m.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-0.5 text-amber-300">
              <StarIcon className="h-3.5 w-3.5" filled />
              <StarIcon className="h-3.5 w-3.5" filled />
              <StarIcon className="h-3.5 w-3.5" filled />
              <StarIcon className="h-3.5 w-3.5" filled />
              <StarIcon className="h-3.5 w-3.5" filled />
            </div>
            <span className="text-[12px] text-white/80">
              Już <span className="font-medium text-white">240+ sprzedawców</span> z kategorii {categoryLabel} promuje oferty
            </span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-[11px] uppercase tracking-[0.6px] text-white/70">
            <BannerStat value="3x" label="odsłon" />
            <BannerStat value="#1" label="pozycja" />
            <BannerStat value="24h" label="aktywacja" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start md:flex-col md:items-end md:gap-2 md:self-center">
          <span className="btn-cta bg-white !text-charcoal hover:opacity-90">
            Sprawdź pakiety
          </span>
          <span className="text-[11px] text-white/50">Bez minimalnego zobowiązania</span>
        </div>
      </div>
    </Link>
  );
}

function BannerStat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[15px] font-medium text-white normal-case tracking-normal">{value}</span>
      <span>{label}</span>
    </span>
  );
}
