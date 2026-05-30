"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasSeenBanner, isFlagEnabled, markBannerSeen, trackFhPlus } from "@/lib/fh-plus";

export function FhPlusBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isFlagEnabled()) return;
    if (hasSeenBanner()) return;
    setVisible(true);
    markBannerSeen();
    trackFhPlus("banner_view");
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/fh-plus"
      onClick={() => trackFhPlus("banner_click")}
      className="group relative block overflow-hidden rounded-2xl bg-cream-light border border-cream-dark transition-shadow hover:shadow-lg mb-10"
    >
      <div className="absolute inset-0 opacity-50 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl transition-all group-hover:bg-amber-200/50" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-charcoal/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <div className="max-w-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Nowość · FH+
          </span>
          <h2 className="text-xl font-light leading-snug text-charcoal md:text-2xl">
            Zwroty za darmo, jutro u Ciebie, early access — <span className="italic">od 29 PLN/rok</span>.
          </h2>
          <p className="text-[13px] text-warm-gray">
            Jedna roczna opłata, cały bundle FH+ na każde zamówienie. Bez ukrytych kosztów, bez automatycznego odnowienia.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1.5 md:items-end">
          <span className="btn-cta">Zobacz pakiety</span>
          <span className="text-[11px] text-warm-gray/70">3 widełki · wybierasz sam</span>
        </div>
      </div>
    </Link>
  );
}
