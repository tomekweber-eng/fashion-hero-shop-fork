"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PLANS, type PlanPrice, trackFhPlus } from "@/lib/fh-plus";

const BUNDLE = [
  "Darmowe zwroty do każdego zamówienia",
  "Dostawa next day bez dopłat",
  "Early access do dropów i wyprzedaży",
  "Cashback 3% na konto FH+",
];

export default function FhPlusPage() {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<PlanPrice | null>(null);
  const selectedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!selectedRef.current) {
        trackFhPlus("plan_dismiss");
      }
    };
  }, []);

  const handleSelect = (price: PlanPrice) => {
    selectedRef.current = true;
    setSelectedPrice(price);
    trackFhPlus("plan_select", { plan_price: price });
  };

  if (selectedPrice !== null) {
    return (
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pakiet {selectedPrice} PLN / rok
        </span>
        <h1 className="text-[28px] md:text-[36px] font-light text-charcoal leading-tight mb-4">
          Dziękujemy, wkrótce odezwiemy się z dostępem do FH+
        </h1>
        <p className="text-sm text-warm-gray mb-10 max-w-md mx-auto">
          Zapisaliśmy Twój wybór. FH+ jest jeszcze w fazie zamkniętej — gdy ruszamy z dostępami, pierwsi dostaną wiadomość kupujący tacy jak Ty.
        </p>
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="btn-cta"
        >
          Wróć do checkoutu
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <nav className="mb-8">
        <ol className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.6px] text-warm-gray">
          <li>
            <Link href="/" className="hover:text-charcoal transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/checkout" className="hover:text-charcoal transition-colors">
              Checkout
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-charcoal">FH+</li>
        </ol>
      </nav>

      <header className="max-w-2xl mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Nowość · FH+
        </span>
        <h1 className="text-[32px] md:text-[44px] font-light leading-tight text-charcoal mb-4">
          FH+ — bądź pierwszą w kolejce
        </h1>
        <p className="text-[15px] text-warm-gray leading-relaxed">
          Roczna subskrypcja, która zmienia każde Twoje zamówienie. Bez ukrytych opłat, bez automatycznego odnowienia — płacisz raz, korzystasz przez 365 dni.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 max-w-2xl">
        {BUNDLE.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-charcoal">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-5 pb-2 border-b border-border">
          Wybierz pakiet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isFeatured = "badge" in plan;
            return (
              <div
                key={plan.price}
                className={`relative flex flex-col p-6 rounded-lg border bg-white transition-all ${
                  isFeatured
                    ? "border-charcoal shadow-lg md:scale-[1.03]"
                    : "border-border hover:border-charcoal/40"
                }`}
              >
                {isFeatured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.6px] text-warm-gray mb-2">
                    {plan.label}
                  </p>
                  <p className="flex items-baseline gap-1">
                    <span className="text-[36px] font-light text-charcoal leading-none">
                      {plan.price}
                    </span>
                    <span className="text-sm text-warm-gray">PLN / rok</span>
                  </p>
                </div>
                <ul className="space-y-2 mb-7 flex-1">
                  {BUNDLE.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[13px] text-charcoal">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-charcoal/40 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleSelect(plan.price)}
                  className={isFeatured ? "btn-cta w-full" : "btn-cta w-full !bg-white !text-charcoal border border-charcoal hover:!bg-charcoal hover:!text-white"}
                >
                  Wybierz
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-warm-gray/70 mt-5 text-center">
          To wczesny program. Po wyborze odezwiemy się mailowo, zanim coś naliczymy.
        </p>
      </section>
    </main>
  );
}
