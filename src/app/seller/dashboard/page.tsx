"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useActiveSeller } from "@/hooks/use-active-seller";
import { SellerSwitcher } from "@/components/seller-switcher";
import { PromotedListingsBanner } from "@/components/promoted-listings-banner";
import { products } from "@/data/products";

export default function SellerDashboardPage() {
  const { seller, hydrated } = useActiveSeller();

  const stats = useMemo(() => {
    const sellerProducts = products.filter((p) => p.sellerId === seller.id);
    return {
      listings: sellerProducts.length,
      avgRating: seller.rating,
      memberSince: seller.joinedYear,
    };
  }, [seller.id, seller.rating, seller.joinedYear]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <nav className="text-[11px] text-warm-gray mb-6 tracking-wide">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal">Seller Dashboard</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-light text-charcoal md:text-3xl">
          {hydrated ? `Witaj, ${seller.name}` : "Witaj"}
        </h1>
        <p className="mt-1 text-[13px] text-warm-gray">
          Twoj panel sprzedawcy w Fashion Hero Marketplace.
        </p>
      </header>

      <div className="mb-8">
        <SellerSwitcher />
      </div>

      <section className="mb-8">
        <PromotedListingsBanner />
      </section>

      <section className="mb-8 grid grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Aktywne oferty" value={stats.listings} />
        <StatCard label="Srednia ocena" value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"} />
        <StatCard label="Sprzedawca od" value={stats.memberSince} />
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-6">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-3 pb-2 border-b border-black/10">
          Ostatnia aktywnosc
        </h2>
        <p className="text-[13px] text-warm-gray">
          To jest demo panel sprzedawcy. Reszta funkcji panelu nie jest czescia tego MVP.
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-label">{label}</p>
      <p className="mt-1 text-xl font-light text-charcoal md:text-2xl">{value}</p>
    </div>
  );
}
