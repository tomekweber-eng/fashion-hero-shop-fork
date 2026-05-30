"use client";

import { useEffect, useRef, useState } from "react";
import { getBuyerProfile, hasSeenBanner, isFlagEnabled, markBannerSeen, PLANS, type PlanPrice, trackFhPlus } from "@/lib/fh-plus";

const BUNDLE = [
  "Darmowe zwroty do każdego zamówienia",
  "Dostawa next day bez dopłat",
  "Early access do dropów i wyprzedaży",
  "Cashback 3% na konto Fashion Hero +",
];

export function FhPlusInlineSection() {
  const [visible, setVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PlanPrice | null>(null);
  const selectedRef = useRef(false);

  useEffect(() => {
    if (!isFlagEnabled()) return;
    const profile = getBuyerProfile();
    if (!profile) return;
    setVisible(true);
    if (!hasSeenBanner(profile.buyer_id)) {
      markBannerSeen(profile.buyer_id);
      trackFhPlus("banner_view");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (visible && !selectedRef.current) {
        trackFhPlus("plan_dismiss");
      }
    };
  }, [visible]);

  if (!visible) return null;

  const handleSelect = (price: PlanPrice) => {
    selectedRef.current = true;
    setSelectedPrice(price);
    trackFhPlus("plan_select", { plan_price: price });
  };

  if (selectedPrice !== null) {
    return (
      <section className="mb-10 relative overflow-hidden rounded-2xl bg-charcoal text-white p-8 text-center shadow-xl shadow-charcoal/20">
        <div className="absolute inset-0 opacity-50 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
            Pakiet {selectedPrice} PLN / rok
          </span>
          <h3 className="text-[20px] md:text-[24px] font-light leading-tight mb-2">
            Dziękujemy, wkrótce odezwiemy się z dostępem do Fashion Hero +
          </h3>
          <p className="text-sm text-white/70 max-w-md mx-auto">
            Zapisaliśmy Twój wybór. Fashion Hero + jest jeszcze w fazie zamkniętej — odezwiemy się mailowo, zanim cokolwiek naliczymy. Możesz spokojnie dokończyć zamówienie poniżej.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 relative overflow-hidden rounded-2xl bg-charcoal text-white p-6 md:p-7 shadow-xl shadow-charcoal/20">
      <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="mb-5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
            Nowość · Fashion Hero +
          </span>
          <h2 className="text-[22px] md:text-[26px] font-light leading-snug text-white mb-2">
            Dodaj <span className="italic">Fashion Hero +</span> do tego zamówienia
          </h2>
          <p className="text-[13px] text-white/75">
            Roczna subskrypcja: darmowe zwroty, next day delivery, early access, cashback 3%. Wybierz cenę, którą uważasz za fair — bez ukrytych kosztów, bez automatycznego odnowienia.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 mb-6 max-w-2xl">
          {BUNDLE.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[12px] text-white/80">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-300 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isFeatured = "badge" in plan;
            return (
              <div
                key={plan.price}
                className={`relative flex flex-col p-4 rounded-lg bg-white transition-all ${
                  isFeatured
                    ? "ring-2 ring-amber-400 shadow-lg shadow-amber-400/20"
                    : "border border-white/10 hover:ring-1 hover:ring-white/40"
                }`}
              >
                {isFeatured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.6px] text-charcoal whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.6px] text-warm-gray mb-1">
                    {plan.label}
                  </p>
                  <p className="flex items-baseline gap-1">
                    <span className="text-[28px] font-light text-charcoal leading-none">
                      {plan.price}
                    </span>
                    <span className="text-[12px] text-warm-gray">PLN / rok</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(plan.price)}
                  className={
                    isFeatured
                      ? "btn-cta w-full !py-2.5 !text-[11px]"
                      : "btn-cta w-full !py-2.5 !text-[11px] !bg-white !text-charcoal border border-charcoal hover:!bg-charcoal hover:!text-white"
                  }
                >
                  Wybierz {plan.price} PLN
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-white/50 mt-4">
          Wczesny program. Po wyborze odezwiemy się mailowo — nic nie naliczamy teraz.
        </p>
      </div>
    </section>
  );
}
