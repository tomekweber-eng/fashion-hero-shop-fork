"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { FhPlusEmailForm } from "@/components/fh-plus-email-form";
import { getBuyerIdentity, PLANS, type PlanPrice, trackFhPlus } from "@/lib/fh-plus";
import { type Cohort, getCohort, identifyForExperiment } from "@/lib/fh-plus-segments";

type Step = "plans" | "commit" | "thanks";

const HERO_COPY: Record<Cohort, { eyebrow: string; headline: string; sub: string }> = {
  G1: {
    eyebrow: "Dla regularnych kupujących",
    headline: "Twoje paczki — następnego dnia. Drop'y — przed wszystkimi.",
    sub: "Fashion Hero + zamienia codzienne zakupy w VIP routine. Bez stania w kolejce po dostawę, bez czekania na drop'y które rozejdą się w 2 minuty.",
  },
  G2: {
    eyebrow: "Dla testujących rozmiary",
    headline: "Zamów 3 rozmiary, oddaj 2 — za darmo, za każdym razem.",
    sub: "Fashion Hero + zdejmuje ciężar kosztów zwrotu. Kupuj odważnie, próbuj odważnie — bez kalkulowania ile Cię będzie kosztował błąd z rozmiarem.",
  },
  G3: {
    eyebrow: "Twoja kolejna paczka",
    headline: "Bundle VIP dla stałych klientów Fashion Hero",
    sub: "Fashion Hero + to wszystko czego oczekujesz od marki premium: darmowe zwroty, next day delivery, early access. Jedna roczna opłata, zero ukrytych kosztów.",
  },
  G4: {
    eyebrow: "Twoja kolejna paczka",
    headline: "Bundle VIP dla stałych klientów Fashion Hero",
    sub: "Fashion Hero + to wszystko czego oczekujesz od marki premium: darmowe zwroty, next day delivery, early access. Jedna roczna opłata, zero ukrytych kosztów.",
  },
};

const STATS = [
  { value: "1,847", label: "kupujących na waitlist" },
  { value: "+38%", label: "częstszych zakupów w pilotażu" },
  { value: "97%", label: "poleciłoby znajomym" },
];

const BENEFITS = [
  {
    icon: "↻",
    title: "Free returns bez limitu",
    body: "Każdy zwrot Twojej paczki opłacony przez nas. Bez kuriera za 19,90, bez biegania do paczkomatu z własną etykietą. Sprawdź 3 rozmiary, oddaj 2 — bez kalkulatora.",
  },
  {
    icon: "⚡",
    title: "Next day delivery",
    body: "Zamówienie do 14:00 = paczka jutro pod drzwiami. Bez dopłat. Dla każdego zamówienia, bez progu kwotowego.",
  },
  {
    icon: "★",
    title: "Early access do dropów",
    body: "Limitowane kolekcje 24h przed publiczną premierą. Wesele, randka, eventowa lista — masz pierwszeństwo do pełnego rozmiarowika.",
  },
  {
    icon: "%",
    title: "Okazjonalny cashback",
    body: "Co kwartał wybrane marki dorzucają 5–10% zwrotu na konto FH+. Im więcej kupujesz, tym szybciej Twoja subskrypcja zwraca się sama.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Wybierz cenę",
    body: "Zdecyduj, ile Fashion Hero + jest dla Ciebie warte. Każda z 3 cen daje ten sam bundle.",
  },
  {
    n: "02",
    title: "Zarezerwuj dostęp",
    body: "Jeden klik (lub email, jeśli nie masz konta) — gwarantujemy Twoją cenę przed launchem.",
  },
  {
    n: "03",
    title: "Korzystaj od dnia 1",
    body: "Gdy ruszymy, dostaniesz mailem aktywację. Płatność dopiero wtedy, bez automatycznego odnowienia.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Wracam do Fashion Hero zamiast Zary tylko dlatego, że wiem, że paczka przyjedzie jutro. Subskrypcja zwraca mi się w jednym dropie sezonowym.",
    name: "Marta, 31",
    role: "Beta-testerka FH+",
  },
  {
    quote:
      "Zwroty bez limitu zmieniły sposób, w jaki kupuję. Wcześniej brałam jeden rozmiar i się modliłam — teraz biorę trzy i wybieram.",
    name: "Ola, 27",
    role: "Beta-testerka FH+",
  },
];

const FAQ = [
  {
    q: "Czy to jest realny produkt, czy fake door?",
    a: "Jesteśmy szczerzy: Fashion Hero + jest w fazie zamkniętej. Twoja rezerwacja pomaga nam zwalidować ile osób tego naprawdę chce. Jeśli pull będzie wystarczający — launchujemy w 4-6 tygodni i informujemy mailem przed pierwszą płatnością.",
  },
  {
    q: "Co jeśli nie launchujecie?",
    a: "Twoja rezerwacja wygasa, nic Ci nie odejmiemy z konta (i tak nic nie odjęliśmy). Email dostaniesz z update'em — bez ghostowania.",
  },
  {
    q: "Czy subskrypcja sama się odnawia?",
    a: "Nie. To była nasza zasada od początku. Po 365 dniach poprosimy o świadomą decyzję, czy chcesz przedłużyć — bez automatu, bez sztuczek.",
  },
  {
    q: "Czemu są 3 ceny za to samo?",
    a: "Bo testujemy ile Fashion Hero + jest warte realnie. Każda z 3 kart daje identyczny bundle — Ty wybierasz, co uważasz za fair. To pomaga nam ustalić ostateczną cenę gdy launchujemy.",
  },
];

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

  const hero = cohort ? HERO_COPY[cohort] : HERO_COPY.G3;

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-300/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-8">
          <nav className="mb-10">
            <ol className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.6px] text-white/50">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">Checkout</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-amber-300">Fashion Hero +</li>
            </ol>
          </nav>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 pb-16 md:pb-20 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
              {hero.eyebrow}
            </span>
            <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-light leading-[1.05] mb-5">
              {hero.headline}
            </h1>
            <p className="text-[15px] md:text-[17px] text-white/75 leading-relaxed max-w-xl mb-7">
              {hero.sub}
            </p>
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="text-[14px] text-white/50">Od</span>
              <span className="text-[40px] font-light text-amber-300 leading-none">29 PLN</span>
              <span className="text-[14px] text-white/50">/ rok · 8 groszy dziennie</span>
            </div>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 mt-6 btn-cta !bg-amber-400 !text-charcoal hover:!bg-amber-300"
            >
              Wybierz swoją cenę
              <span aria-hidden>↓</span>
            </a>
          </div>

          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[420px] rounded-2xl overflow-hidden shadow-2xl shadow-charcoal/40">
            <Image
              src="/images/hero/hero-2.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" aria-hidden />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.8px] text-amber-300 mb-0.5">
                  Edycja zamknięta
                </p>
                <p className="text-[16px] font-light text-white leading-tight">
                  Phase 1 · tylko 2000 miejsc
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-cream-light">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 py-4 sm:py-2 text-center">
              <p className="text-[32px] md:text-[36px] font-light text-charcoal leading-none mb-1.5">
                {s.value}
              </p>
              <p className="text-[12px] uppercase tracking-[0.6px] text-warm-gray">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits / bundle */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.8px] text-amber-600 mb-3">
            Co dostajesz w środku
          </p>
          <h2 className="text-[28px] md:text-[36px] font-light text-charcoal leading-[1.15]">
            Bundle, który zmienia każdą paczkę — niezależnie od ceny, którą wybierzesz.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BENEFITS.map((b) => (
            <article
              key={b.title}
              className="relative p-7 rounded-2xl bg-cream-light border border-cream-dark transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-charcoal text-[24px] font-light mb-5">
                {b.icon}
              </span>
              <h3 className="text-[18px] font-medium text-charcoal mb-2 leading-tight">
                {b.title}
              </h3>
              <p className="text-[14px] text-warm-gray leading-relaxed">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-charcoal text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.8px] text-amber-300 mb-3">
              Jak to działa
            </p>
            <h2 className="text-[28px] md:text-[36px] font-light leading-[1.15]">
              3 kroki. Bez płatności teraz, bez automatycznego odnowienia.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span className="text-[64px] font-light text-amber-300/80 leading-none block mb-3">
                  {s.n}
                </span>
                <h3 className="text-[18px] font-medium text-white mb-2">{s.title}</h3>
                <p className="text-[14px] text-white/70 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 scroll-mt-8">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.8px] text-amber-600 mb-3">
            {step === "plans" ? "Wybierz cenę" : `Pakiet ${selectedPrice} PLN — potwierdź`}
          </p>
          <h2 className="text-[28px] md:text-[36px] font-light text-charcoal leading-[1.15] mb-4">
            {step === "plans"
              ? "Ten sam bundle. Trzy ceny. Ty decydujesz, ile Fashion Hero + jest dla Ciebie warte."
              : "Ostatni krok — zarezerwuj swoją cenę."}
          </h2>
          {step === "plans" && (
            <p className="text-[14px] text-warm-gray leading-relaxed">
              Nie zwiększymy ceny po Twojej rezerwacji. Nie podzielimy bundle'a. Nie zaczniemy automatycznie pobierać — odezwiemy się mailem przed launchem.
            </p>
          )}
        </div>

        {step === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <button
                key={plan.price}
                type="button"
                data-attr={`fh-plus-plan-${plan.price}`}
                onClick={() => handlePlanClick(plan.price)}
                className="group relative flex flex-col p-7 rounded-2xl border border-border bg-white text-left transition-all hover:border-charcoal hover:shadow-xl hover:-translate-y-1"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.6px] text-warm-gray mb-3">
                  {plan.label}
                </p>
                <p className="flex items-baseline gap-1 mb-2">
                  <span className="text-[44px] font-light text-charcoal leading-none">
                    {plan.price}
                  </span>
                  <span className="text-sm text-warm-gray">PLN / rok</span>
                </p>
                <p className="text-[11px] text-warm-gray mb-7">
                  ≈ {(plan.price / 365).toFixed(2).replace(".", ",")} PLN / dzień
                </p>
                <ul className="space-y-2 mb-7 flex-1">
                  <li className="flex items-start gap-2 text-[13px] text-charcoal leading-snug">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    Pełny bundle Fashion Hero +
                  </li>
                  <li className="flex items-start gap-2 text-[13px] text-charcoal leading-snug">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    Cena gwarantowana przy launchu
                  </li>
                  <li className="flex items-start gap-2 text-[13px] text-charcoal leading-snug">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    Bez automatycznego odnowienia
                  </li>
                </ul>
                <span className="mt-auto inline-flex items-center justify-center w-full bg-cream-light text-charcoal text-[12px] font-medium uppercase tracking-[0.6px] py-3 rounded transition-colors group-hover:bg-charcoal group-hover:text-white">
                  Zarezerwuj {plan.price} PLN
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "commit" && selectedPrice !== null && (
          <div className="bg-cream-light rounded-2xl p-7 md:p-9 max-w-2xl border border-cream-dark">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-charcoal mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-charcoal" />
              {selectedPrice} PLN / rok
            </span>
            {isIdentified ? (
              <>
                <h3 className="text-[22px] font-light text-charcoal mb-3 leading-tight">
                  Zarezerwuj cenę {selectedPrice} PLN — jeden klik
                </h3>
                <p className="text-sm text-warm-gray mb-7 leading-relaxed">
                  Email mamy z konta, nie pytamy ponownie. Powiadomimy Cię mailowo gdy launchujemy FH+ — dostaniesz dostęp w tej cenie, bez podwyżki. Bez płatności teraz.
                </p>
                <button
                  type="button"
                  data-attr="fh-plus-confirm-logged-in"
                  onClick={handleConfirmLoggedIn}
                  className="btn-cta w-full sm:w-auto sm:min-w-[320px]"
                >
                  Tak, zarezerwuj cenę {selectedPrice} PLN
                </button>
              </>
            ) : (
              <>
                <h3 className="text-[22px] font-light text-charcoal mb-3 leading-tight">
                  Zostaw email — zablokujemy dostęp w cenie {selectedPrice} PLN
                </h3>
                <p className="text-sm text-warm-gray mb-7 leading-relaxed">
                  Dostaniesz mail gdy ruszymy. Bez płatności teraz, bez spamu, bez automatycznych obciążeń.
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
              className="text-[12px] text-warm-gray hover:text-charcoal underline mt-7"
            >
              ← Zmień pakiet
            </button>
          </div>
        )}
      </section>

      {/* Testimonials */}
      {step === "plans" && (
        <section className="bg-cream-light py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="max-w-2xl mb-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.8px] text-amber-600 mb-3">
                Beta program · 60 osób
              </p>
              <h2 className="text-[24px] md:text-[32px] font-light text-charcoal leading-[1.15]">
                Co mówią pierwsze klientki Fashion Hero +
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  className="bg-white rounded-2xl p-7 border border-cream-dark"
                >
                  <div className="text-amber-400 text-[20px] leading-none mb-3" aria-hidden>★★★★★</div>
                  <blockquote className="text-[15px] text-charcoal leading-relaxed mb-5">
                    „{t.quote}"
                  </blockquote>
                  <figcaption className="flex items-center gap-3 pt-4 border-t border-cream-dark">
                    <span className="h-10 w-10 rounded-full bg-charcoal text-white flex items-center justify-center text-[14px] font-medium">
                      {t.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium text-charcoal">{t.name}</span>
                      <span className="block text-[11px] text-warm-gray uppercase tracking-[0.6px]">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {step === "plans" && (
        <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.8px] text-amber-600 mb-3">
              Często zadawane pytania
            </p>
            <h2 className="text-[28px] md:text-[36px] font-light text-charcoal leading-[1.15]">
              Bez ukrytych haczyków. Pytaj śmiało.
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-white p-5 open:shadow-md transition-shadow"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <span className="text-[15px] font-medium text-charcoal leading-snug">
                    {item.q}
                  </span>
                  <span className="text-amber-500 text-[20px] leading-none group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[14px] text-warm-gray leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      {step === "plans" && (
        <section className="relative overflow-hidden bg-charcoal text-white">
          <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-amber-300/20 blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20 text-center">
            <h2 className="text-[28px] md:text-[40px] font-light leading-[1.1] mb-5">
              Zarezerwuj swoją cenę zanim podniesiemy.
            </h2>
            <p className="text-[15px] text-white/70 leading-relaxed mb-8 max-w-xl mx-auto">
              Pierwsze 2000 miejsc dostaje cenę z Twojego dzisiejszego wyboru — gwarantowaną przy launchu. Bez płatności teraz.
            </p>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 btn-cta !bg-amber-400 !text-charcoal hover:!bg-amber-300"
            >
              Wybieram pakiet
              <span aria-hidden>↑</span>
            </a>
            <p className="mt-6 text-[11px] uppercase tracking-[0.6px] text-white/40">
              Fashion Hero · phase 1 · waitlist closes when 2000 miejsc się zapełni
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
