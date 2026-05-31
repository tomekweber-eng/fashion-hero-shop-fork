"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBuyerIdentity, hasSeenBanner, isFlagEnabled, markBannerSeen } from "@/lib/fh-plus";
import {
  type Cohort,
  getCohort,
  identifyForExperiment,
  isExposedCohort,
} from "@/lib/fh-plus-segments";
import { type AbGroup, getAbGroup } from "@/lib/fh-plus-ab";

interface Hook {
  eyebrow: string;
  headline: string;
  cta: string;
}

const HOOKS: Record<"G1" | "G2", Hook> = {
  G1: {
    eyebrow: "Dla regularnych",
    headline: "Next day delivery + early access do dropów",
    cta: "Sprawdź FH+",
  },
  G2: {
    eyebrow: "Dla testujących rozmiary",
    headline: "Zamów więcej rozmiarów bez stresu o koszty zwrotu",
    cta: "Sprawdź FH+",
  },
};

export function FhPlusBanner() {
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [abGroup, setAbGroup] = useState<AbGroup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isFlagEnabled()) return;
    const identity = getBuyerIdentity();
    if (!identity) return;
    const c = getCohort();
    const ab = getAbGroup(c);
    setCohort(c);
    setAbGroup(ab);
    identifyForExperiment();
    if (!isExposedCohort(c)) return;
    if (ab !== "experimental") return;
    if (hasSeenBanner(identity.buyer_id)) return;
    setVisible(true);
    markBannerSeen(identity.buyer_id);
  }, []);

  if (!visible || !cohort || !isExposedCohort(cohort)) return null;

  const hook = HOOKS[cohort];

  return (
    <section className="mb-8 relative overflow-hidden rounded-2xl bg-charcoal text-white shadow-xl shadow-charcoal/20">
      <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
            {hook.eyebrow} · Fashion Hero +
          </span>
          <h2 className="text-[20px] md:text-[24px] font-light leading-snug text-white mb-1">
            {hook.headline}
          </h2>
          <p className="text-[13px] text-white/65">
            Roczna subskrypcja od 29 PLN · darmowy bundle dla stałych klientów
          </p>
        </div>
        <Link
          href="/fh-plus"
          data-attr="fh-plus-banner-cta"
          className="btn-cta shrink-0 self-start md:self-center"
        >
          {hook.cta}
        </Link>
      </div>
      <span className="sr-only" data-fh-cohort={cohort} data-fh-ab={abGroup}>
        {cohort}:{abGroup}
      </span>
    </section>
  );
}
