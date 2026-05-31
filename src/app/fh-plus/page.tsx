"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { FhPlusEmailForm } from "@/components/fh-plus-email-form";
import { BUNDLE, getBuyerIdentity, PLANS, type PlanPrice, trackFhPlus } from "@/lib/fh-plus";
import { type Cohort, getCohort, identifyForExperiment } from "@/lib/fh-plus-segments";

type Step = "plans" | "commit" | "thanks";

const HERO_COPY: Record<Cohort, { eyebrow: string; headline: string }> = {
  G1: {
    eyebrow: "Dla regularnych",
    headline: "Next day delivery + early access do dropów",
  },
  G2: {
    eyebrow: "Dla testujących rozmiary",
    headline: "Zamów więcej rozmiarów bez stresu o koszty zwrotu",
  },
  G3: {
    eyebrow: "Fashion Hero +",
    headline: "Bundle VIP dla stałych klientów",
  },
  G4: {
    eyebrow: "Fashion Hero +",
    headline: "Bundle VIP dla stałych klientów",
  },
};

export default function FhPlusPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("plans");
  const [selectedPrice, setSelectedPrice] = useState<PlanPrice | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);

  useEffect(() => {
    setCohort(getCohort());
    identifyForExperiment();
  }, []);

  const handlePlanClick = (price: PlanPrice) => {
    setSelectedPrice(price);
    setStep("commit");
    // Plan click is captured via autocapture data-attr (fh-plus-plan-29/49/79)
    // — no custom event needed; Actions already match these buttons.
  };

  const handleConfirmLoggedIn = () => {
    if (selectedPrice === null) return;
    trackFhPlus("fh_plus_commit_logged_in", { plan_price: selectedPrice });
    setStep("thanks");
  };

  const handleAnonCommit = () => {
    setStep("thanks");
  };

  const identity = getBuyerIdentity();
  const isIdentified = !!user || identity?.is_identified || false;

  if (step === "thanks") {
    return (
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {selectedPrice} PLN / rok zarezerwowane
        </span>
        <h1 className="text-[28px] md:text-[36px] font-light text-charcoal leading-tight mb-4">
          Dziękujemy, wkrótce odezwiemy się z dostępem do FH+
        </h1>
        <p className="text-sm text-warm-gray mb-10 max-w-md mx-auto">
          Fashion Hero + jest jeszcze w fazie zamkniętej — odezwiemy się mailowo, zanim cokolwiek naliczymy. Możesz spokojnie wrócić do checkoutu.
        </p>
        <button type="button" onClick={() => router.push("/checkout")} className="btn-cta">
          Wróć do checkoutu
        </button>
      </main>
    );
  }

  const hero = cohort ? HERO_COPY[cohort] : HERO_COPY.G1;

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

      <header className="max-w-2xl mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {hero.eyebrow} · Fashion Hero +
        </span>
        <h1 className="text-[32px] md:text-[44px] font-light leading-[1.1] text-charcoal mb-4">
          {hero.headline}
        </h1>
        <p className="text-[15px] text-warm-gray leading-relaxed">
          Roczna subskrypcja, która zmienia każde Twoje zamówienie. Bez ukrytych opłat, bez automatycznego odnowienia — płacisz raz, korzystasz przez 365 dni.
        </p>
      </header>

      <section aria-labelledby="bundle-heading" className="mb-10 max-w-2xl">
        <h2 id="bundle-heading" className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-4">
          Bundle (ten sam dla każdej ceny)
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {BUNDLE.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[13px] text-charcoal">
              <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-charcoal text-[10px] font-bold">
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-5 pb-2 border-b border-border">
          {step === "plans" ? "Wybierz cenę" : `Pakiet ${selectedPrice} PLN — potwierdź`}
        </h2>

        {step === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <button
                key={plan.price}
                type="button"
                data-attr={`fh-plus-plan-${plan.price}`}
                onClick={() => handlePlanClick(plan.price)}
                className="group relative flex flex-col p-6 rounded-lg border border-border bg-white text-left transition-all hover:border-charcoal hover:shadow-lg"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.6px] text-warm-gray mb-2">
                  {plan.label}
                </p>
                <p className="flex items-baseline gap-1 mb-5">
                  <span className="text-[36px] font-light text-charcoal leading-none">
                    {plan.price}
                  </span>
                  <span className="text-sm text-warm-gray">PLN / rok</span>
                </p>
                <span className="mt-auto inline-flex items-center justify-center w-full bg-cream-light text-charcoal text-[11px] font-medium uppercase tracking-[0.6px] py-2.5 rounded transition-colors group-hover:bg-charcoal group-hover:text-white">
                  Wybierz
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "commit" && selectedPrice !== null && (
          <div className="bg-cream-light rounded-lg p-6 md:p-8 max-w-2xl">
            {isIdentified ? (
              <>
                <h3 className="text-[18px] font-light text-charcoal mb-2">
                  Zarezerwuj cenę {selectedPrice} PLN / rok
                </h3>
                <p className="text-sm text-warm-gray mb-6">
                  Powiadomimy Cię mailowo gdy launchujemy FH+ — dostaniesz dostęp w tej cenie, bez podwyżki. Bez płatności teraz.
                </p>
                <button
                  type="button"
                  data-attr="fh-plus-confirm-logged-in"
                  onClick={handleConfirmLoggedIn}
                  className="btn-cta w-full sm:w-auto sm:min-w-[320px]"
                >
                  Tak, zarezerwuj cenę {selectedPrice} PLN — powiadomimy gdy launchujemy
                </button>
              </>
            ) : (
              <>
                <h3 className="text-[18px] font-light text-charcoal mb-2">
                  Zarezerwuj cenę {selectedPrice} PLN / rok
                </h3>
                <p className="text-sm text-warm-gray mb-6">
                  Zostaw email — zablokujemy dostęp w tej cenie gdy ruszymy. Bez płatności teraz.
                </p>
                <FhPlusEmailForm planPrice={selectedPrice} onCommit={handleAnonCommit} />
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedPrice(null);
                setStep("plans");
              }}
              className="text-[12px] text-warm-gray hover:text-charcoal underline mt-6"
            >
              ← Zmień pakiet
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
