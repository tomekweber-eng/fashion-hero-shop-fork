"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveSeller } from "@/hooks/use-active-seller";
import { getSellerPilotCategory, PILOT_CATEGORY_LABEL } from "@/lib/seller-category";
import { track } from "@/lib/analytics";
import type { PromotionPackage } from "@/types/promoted-listings";

const PRESET_PACKAGES: { id: Exclude<PromotionPackage, "custom">; amount: number; subtitle: string }[] = [
  { id: "49", amount: 49, subtitle: "Start — wyrozniona pozycja w kategorii" },
  { id: "199", amount: 199, subtitle: "Premium — top kategorii + karuzela na home" },
];

export default function PromotedListingsLandingPage() {
  const router = useRouter();
  const { seller, hydrated } = useActiveSeller();
  const category = getSellerPilotCategory(seller.id);

  const [selected, setSelected] = useState<PromotionPackage | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const viewKey = useRef<string | null>(null);
  const selectedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    const key = `${seller.id}:${category ?? "none"}`;
    if (viewKey.current === key) return;
    viewKey.current = key;
    track("promoted_listings_landing_viewed", {
      sellerId: seller.id,
      sellerCategory: category ?? null,
    });
  }, [hydrated, seller.id, category]);

  useEffect(() => {
    return () => {
      if (selectedRef.current) return;
      if (!viewKey.current) return;
      track("promoted_listings_landing_exited", {
        sellerId: seller.id,
        sellerCategory: category ?? null,
      });
    };
  }, [seller.id, category]);

  if (hydrated && !category) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-light text-charcoal">Promoted Listings</h1>
        <p className="mt-3 text-[13px] text-warm-gray">
          Ten program jest aktualnie dostepny tylko dla wybranych kategorii (Shoes, Bags).
        </p>
        <Link href="/seller/dashboard" className="btn-cta-outline mt-6 inline-flex">
          Wroc do panelu
        </Link>
      </div>
    );
  }

  const handleSelect = (pkg: PromotionPackage, amount?: number) => {
    if (!category) return;
    selectedRef.current = true;
    setSelected(pkg);
    track("promoted_listings_package_selected", {
      sellerId: seller.id,
      sellerCategory: category,
      package: pkg,
      customAmount: amount ?? null,
    });
    setConfirmed(true);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    handleSelect("custom", amount);
  };

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-white text-xl">
          ✓
        </div>
        <h1 className="text-2xl font-light text-charcoal">Dziekujemy!</h1>
        <p className="mt-3 text-[13px] text-warm-gray">
          Wkrotce odezwiemy sie z dostepem do Promoted Listings dla kategorii{" "}
          {category ? PILOT_CATEGORY_LABEL[category] : ""}.
        </p>
        <p className="mt-1 text-[12px] text-warm-gray">
          Wybrales pakiet:{" "}
          <span className="font-medium text-charcoal">
            {selected === "custom" ? `Custom (${customAmount} PLN)` : `${selected} PLN`}
          </span>
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/seller/dashboard" className="btn-cta">
            Wroc do panelu
          </Link>
          <button
            onClick={() => {
              setConfirmed(false);
              setSelected(null);
              setCustomAmount("");
              selectedRef.current = false;
            }}
            className="text-[12px] text-warm-gray underline hover:text-charcoal"
          >
            Zmien wybor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <nav className="text-[11px] text-warm-gray mb-6 tracking-wide">
        <Link href="/seller/dashboard" className="hover:text-charcoal transition-colors">Dashboard</Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal">Promoted Listings</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <span className="text-label">
          {hydrated && category ? `Dla ${PILOT_CATEGORY_LABEL[category]} sellers` : "Pilot program"}
        </span>
        <h1 className="mt-2 text-3xl font-light text-charcoal md:text-4xl">
          Sprzedawaj wiecej z Promoted Listings
        </h1>
        <p className="mt-3 text-[14px] text-warm-gray">
          Wybierz pakiet platnej promocji dopasowany do skali Twojej sprzedazy.
          Twoje produkty wystrzela na top kategorii i wybranych miejsc w serwisie.
        </p>
      </header>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        {PRESET_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => handleSelect(pkg.id)}
            className="group flex flex-col items-start rounded-xl border border-black/10 bg-white p-6 text-left transition-all hover:border-charcoal hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <span className="text-label">Pakiet {pkg.amount} PLN</span>
            <span className="mt-3 text-3xl font-light text-charcoal">
              {pkg.amount} <span className="text-base text-warm-gray">PLN</span>
            </span>
            <p className="mt-3 text-[13px] text-warm-gray">{pkg.subtitle}</p>
            <span className="btn-cta mt-6 w-full justify-center">Wybierz</span>
          </button>
        ))}

        <form
          onSubmit={handleCustomSubmit}
          className="flex flex-col items-start rounded-xl border border-black/10 bg-white p-6"
        >
          <span className="text-label">Custom</span>
          <span className="mt-3 text-3xl font-light text-charcoal">
            Wlasna <span className="text-base text-warm-gray">kwota</span>
          </span>
          <p className="mt-3 text-[13px] text-warm-gray">
            Powiedz nam ile chcesz przeznaczyc na promocje miesiecznie.
          </p>
          <div className="mt-4 flex w-full items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="np. 500"
              className="flex-1 rounded-md border border-black/15 bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-[13px] text-warm-gray">PLN</span>
          </div>
          <button type="submit" className="btn-cta mt-4 w-full justify-center">
            Wybierz
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-black/10 bg-cream-light p-6">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-3">
          Jak to dziala
        </h2>
        <ol className="space-y-2 text-[13px] text-warm-gray">
          <li>1. Wybierasz pakiet platnej promocji.</li>
          <li>2. Zapisujemy Twoje zainteresowanie wraz z kategoria sprzedawcy.</li>
          <li>3. Wkrotce odezwiemy sie z dostepem do narzedzia Promoted Listings.</li>
        </ol>
      </section>

      <button
        onClick={() => router.back()}
        className="mt-8 text-[12px] text-warm-gray underline hover:text-charcoal"
      >
        Wroc
      </button>
    </div>
  );
}
