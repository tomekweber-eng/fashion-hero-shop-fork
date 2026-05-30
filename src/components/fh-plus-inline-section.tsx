"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getBuyerProfile, hasSeenBanner, isFlagEnabled, markBannerSeen, PLANS, type PlanPrice, trackFhPlus } from "@/lib/fh-plus";

const BUNDLE = [
  { headline: "Zwroty 0 PLN", sub: "do każdego zamówienia, bez wymówek" },
  { headline: "Next day delivery", sub: "bez dopłat, każda paczka" },
  { headline: "Early access", sub: "drop'y i wyprzedaże 48h wcześniej" },
  { headline: "Cashback 3%", sub: "wraca do Ciebie na konto Fashion Hero +" },
];

interface FhPlusInlineSectionProps {
  variant?: "hero" | "inline";
}

export function FhPlusInlineSection({ variant = "hero" }: FhPlusInlineSectionProps) {
  const isHero = variant === "hero";
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
      <section className="mb-10 relative overflow-hidden rounded-2xl bg-charcoal text-white shadow-xl shadow-charcoal/20">
        <div className={isHero ? "grid grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid grid-cols-1"}>
          <div className="relative p-8 md:p-10 text-center lg:text-left flex flex-col justify-center">
            <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
                Witamy w klubie · {selectedPrice} PLN / rok
              </span>
              <h3 className="text-[24px] md:text-[30px] font-light leading-tight mb-3">
                Jesteś na liście. Dziękujemy.
              </h3>
              <p className="text-sm text-white/75 max-w-lg lg:mx-0 mx-auto">
                Fashion Hero + jest jeszcze w fazie zamkniętej — odezwiemy się mailowo, zanim cokolwiek naliczymy. Dokończ spokojnie zamówienie poniżej.
              </p>
            </div>
          </div>
          {isHero && (
            <div className="relative hidden lg:block">
              <Image
                src="/images/hero/hero-1.jpg"
                alt=""
                fill
                sizes="320px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-charcoal/30 to-charcoal" aria-hidden />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 relative overflow-hidden rounded-2xl bg-charcoal text-white shadow-xl shadow-charcoal/20">
      <div className={isHero ? "grid grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid grid-cols-1"}>
        {/* LEFT: marketing + cards */}
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
              Nowość · Premium dla stałych klientów
            </span>

            <h2 className="text-[26px] md:text-[34px] font-light leading-[1.1] text-white mb-3 max-w-xl">
              Twoje zakupy w trybie <span className="italic text-amber-300">VIP</span>.
              <br className="hidden md:block" />
              Już od <span className="font-medium">29 PLN / rok</span>.
            </h2>
            <p className="text-[14px] text-white/80 max-w-xl mb-7 leading-relaxed">
              <strong className="text-white">Fashion Hero +</strong> zamienia każde Twoje zamówienie w VIP-owe doświadczenie — szybciej, taniej, z dostępem do dropów przed wszystkimi. Płacisz raz w roku, korzystasz codziennie.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-8 max-w-2xl">
              {BUNDLE.map((b) => (
                <li key={b.headline} className="flex items-start gap-2.5">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-charcoal text-[11px] font-bold">
                    ✓
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-white leading-tight">{b.headline}</span>
                    <span className="block text-[11px] text-white/60 leading-snug">{b.sub}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mb-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.8px] text-white/50 mb-3">
                Wybierz swoją cenę — bundle ten sam
              </p>
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
            </div>

            <p className="text-[11px] text-white/50">
              Wczesny program · po wyborze odezwiemy się mailowo · nic nie naliczamy teraz · bez automatycznego odnowienia
            </p>
          </div>
        </div>

        {/* RIGHT: hero image — only in hero variant */}
        {isHero && (
        <div className="relative hidden lg:block">
          <Image
            src="/images/hero/hero-1.jpg"
            alt=""
            fill
            sizes="320px"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-charcoal/20 to-charcoal" aria-hidden />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.8px] text-amber-300">
                Edycja limitowana
              </p>
              <p className="text-[18px] font-light text-white leading-tight">
                Twoja kolejna paczka, ale jako VIP.
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
