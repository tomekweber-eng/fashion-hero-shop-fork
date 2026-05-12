"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveSeller } from "@/hooks/use-active-seller";
import { getSellerPilotCategory, PILOT_CATEGORY_LABEL } from "@/lib/seller-category";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PlusIcon, MinusIcon, StarIcon } from "@/components/icons";
import type { PromotionPackage } from "@/types/promoted-listings";

const PRESET_PACKAGES: {
  id: Exclude<PromotionPackage, "custom">;
  amount: number;
  subtitle: string;
  bullets: string[];
  badge?: string;
}[] = [
  {
    id: "49",
    amount: 49,
    subtitle: "Start",
    bullets: [
      "Wyrozniona pozycja w kategorii",
      "Badge PROMOWANE na karcie produktu",
      "Raport miesieczny z efektow",
    ],
  },
  {
    id: "199",
    amount: 199,
    subtitle: "Premium",
    badge: "Najczesciej wybierane",
    bullets: [
      "Top 3 miejsca w kategorii",
      "Karuzela promowanych na home",
      "Boost na liscie wyszukiwania",
      "Dedykowany opiekun konta",
    ],
  },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Jak szybko zobacze efekty?",
    a: "Twoje produkty trafiaja na promowane pozycje w ciagu 24h od aktywacji pakietu. Pierwsze wyniki (wzrost CTR i odslon) widac zwykle juz w pierwszym tygodniu.",
  },
  {
    q: "Czy moge anulowac w dowolnym momencie?",
    a: "Tak. Pakiet jest miesieczny i mozesz go anulowac przed kolejnym okresem rozliczeniowym. Nie ma minimalnego zobowiazania.",
  },
  {
    q: "Czym rozni sie pakiet 49 PLN od 199 PLN?",
    a: "Pakiet 49 PLN daje wyroznienie w obrebie kategorii. Pakiet 199 PLN dodatkowo umieszcza Twoje produkty w karuzeli na stronie glownej oraz boostuje je na liscie wyszukiwania.",
  },
  {
    q: "Czy promocja dotyczy wszystkich moich produktow?",
    a: "Tak. Wszystkie produkty w Twoim sklepie sa rotowane w slotach promowanych w trakcie trwania pakietu. W pakiecie Premium dodajemy do tego rotacje na home page.",
  },
  {
    q: "Co jesli moja kategoria nie jest jeszcze w pilotazu?",
    a: "Pilot obejmuje aktualnie Shoes i Bags. Pracujemy nad rozszerzeniem na kolejne kategorie. Zostaw nam swoje zainteresowanie - dolaczysz do listy oczekujacych z priorytetem dostepu.",
  },
  {
    q: "Jak mierzymy skutecznosc?",
    a: "Raportujemy: liczbe odslon, wspolczynnik klikniec (CTR), liczbe wejsc na karte produktu z promocji oraz przypisany przychod. Wszystko w raporcie miesiecznym.",
  },
];

export default function PromotedListingsLandingPage() {
  const router = useRouter();
  const { seller, hydrated } = useActiveSeller();
  const category = getSellerPilotCategory(seller.id);

  const [selected, setSelected] = useState<PromotionPackage | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-white text-2xl">
          ✓
        </div>
        <h1 className="text-3xl font-light text-charcoal">Dziekujemy!</h1>
        <p className="mt-3 text-[14px] text-warm-gray">
          Wkrotce odezwiemy sie z dostepem do Promoted Listings dla kategorii{" "}
          <span className="text-charcoal font-medium">
            {category ? PILOT_CATEGORY_LABEL[category] : ""}
          </span>
          .
        </p>
        <p className="mt-2 text-[13px] text-warm-gray">
          Wybrales pakiet:{" "}
          <span className="font-medium text-charcoal">
            {selected === "custom" ? `Custom (${customAmount} PLN)` : `${selected} PLN`}
          </span>
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
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

  const categoryLabel = hydrated && category ? PILOT_CATEGORY_LABEL[category] : "Pilot";

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
          <nav className="text-[11px] text-white/60 mb-8 tracking-wide">
            <Link href="/seller/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white">Promoted Listings</span>
          </nav>

          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px]">
            Pilot · Dla {categoryLabel} sellers
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-light leading-tight md:text-6xl">
            Twoje produkty na <span className="italic">pierwszym</span> miejscu kategorii.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] text-white/80 md:text-[16px]">
            Promoted Listings to platna promocja, ktora wystrzela Twoje oferty na top wynikow w kategorii {categoryLabel} i karuzele na stronie glownej Fashion Hero.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#packages" className="btn-cta bg-white !text-charcoal hover:opacity-90">
              Zobacz pakiety
            </a>
            <a href="#how-it-works" className="text-[12px] uppercase tracking-[0.6px] text-white/70 underline-offset-4 hover:text-white hover:underline">
              Jak to dziala
            </a>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <HeroStat value="3x" label="wiecej odslon" />
            <HeroStat value="#1" label="pozycja w kategorii" />
            <HeroStat value="24h" label="czas aktywacji" />
          </div>
        </div>
      </section>

      {/* MOCKUP — Tak to wyglada */}
      <section className="bg-cream-light py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 max-w-2xl">
            <span className="text-label">Tak to wyglada</span>
            <h2 className="mt-2 text-3xl font-light text-charcoal md:text-4xl">
              Twoj produkt na szczycie kategorii{categoryLabel ? ` ${categoryLabel}` : ""}.
            </h2>
            <p className="mt-3 text-[14px] text-warm-gray">
              Tak widzi Twoja oferte kazdy klient, ktory wchodzi w kategorie. Pozycja #1, jasny badge i lepszy CTR.
            </p>
          </div>

          <CategoryMockup categoryLabel={categoryLabel} sellerName={seller.name} />
        </div>
      </section>

      {/* WHY */}
      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 max-w-2xl">
            <span className="text-label">Dlaczego to dziala</span>
            <h2 className="mt-2 text-3xl font-light text-charcoal md:text-4xl">
              3 powody, dla ktorych klienci zobacza Twoje produkty pierwsi.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <BenefitCard
              icon="01"
              title="Top kategorii"
              body="Pierwsze 3 pozycje w kategorii naleza do promowanych sprzedawcow. To one zbieraja 60%+ klikniec."
            />
            <BenefitCard
              icon="02"
              title="Karuzela na home"
              body="Pakiet Premium umieszcza Twoje produkty w karuzeli promowanych na stronie glownej Fashion Hero."
            />
            <BenefitCard
              icon="03"
              title="Boost w wyszukiwarce"
              body="Twoje produkty trafiaja wyzej na liscie wynikow wyszukiwania w obrebie Twojej kategorii."
            />
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="bg-cream-light py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 max-w-2xl">
            <span className="text-label">Wybierz pakiet</span>
            <h2 className="mt-2 text-3xl font-light text-charcoal md:text-4xl">
              Zacznij od 49 PLN. Bez minimalnego zobowiazania.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {PRESET_PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                amount={pkg.amount}
                subtitle={pkg.subtitle}
                bullets={pkg.bullets}
                badge={pkg.badge}
                highlight={pkg.id === "199"}
                onSelect={() => handleSelect(pkg.id)}
              />
            ))}

            <form
              onSubmit={handleCustomSubmit}
              className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 md:p-7"
            >
              <span className="text-label">Custom</span>
              <span className="mt-3 text-3xl font-light text-charcoal md:text-4xl">
                Wlasna <span className="text-base text-warm-gray align-middle">kwota</span>
              </span>
              <p className="mt-3 text-[13px] text-warm-gray">
                Powiedz nam ile chcesz przeznaczyc miesiecznie. Dopasujemy program do Twojego budzetu.
              </p>
              <div className="mt-4 flex items-center gap-2">
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
              <button type="submit" className="btn-cta mt-auto w-full justify-center !mt-6">
                Wybierz
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-background py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 max-w-2xl">
            <span className="text-label">Jak to dziala</span>
            <h2 className="mt-2 text-3xl font-light text-charcoal md:text-4xl">
              3 kroki do pozycji #1 w Twojej kategorii.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              number="01"
              title="Wybierz pakiet"
              body="Dopasuj pakiet do swojej skali sprzedazy. Mozesz zaczac od 49 PLN i skalowac dalej."
            />
            <StepCard
              number="02"
              title="My weryfikujemy"
              body="Sprawdzamy Twoje konto i produkty, zeby promocja byla zgodna z polityka Fashion Hero. Zwykle 24h."
            />
            <StepCard
              number="03"
              title="Twoje produkty na top"
              body="Aktywujemy promocje. Produkty leca na pierwsze miejsca w kategorii i wybranych miejscach serwisu."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream-light py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <span className="text-label">FAQ</span>
            <h2 className="mt-2 text-3xl font-light text-charcoal md:text-4xl">
              Najczestsze pytania
            </h2>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={item.q}
                question={item.q}
                answer={item.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                isLast={i === FAQ_ITEMS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-charcoal py-16 text-center text-white md:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-light md:text-4xl">Gotowy, zeby trafic na #1?</h2>
          <p className="mt-3 text-[14px] text-white/70">
            Wybierz pakiet platnej promocji i odbierz pierwsze odslony juz dzis.
          </p>
          <a href="#packages" className="btn-cta bg-white !text-charcoal hover:opacity-90 mt-7 inline-flex">
            Zobacz pakiety
          </a>
          <div className="mt-8">
            <button
              onClick={() => router.back()}
              className="text-[12px] text-white/60 underline hover:text-white"
            >
              Wroc do panelu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-light text-white md:text-4xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.6px] text-white/60">{label}</p>
    </div>
  );
}

function BenefitCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-7">
      <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-warm-gray">{icon}</span>
      <h3 className="mt-3 text-xl font-medium text-charcoal">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-warm-gray">{body}</p>
    </div>
  );
}

function StepCard({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="relative rounded-2xl border border-black/10 bg-white p-6 md:p-7">
      <span className="absolute -top-4 left-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-charcoal text-[14px] font-medium text-white">
        {number}
      </span>
      <h3 className="mt-4 text-xl font-medium text-charcoal">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-warm-gray">{body}</p>
    </div>
  );
}

function PackageCard({
  amount,
  subtitle,
  bullets,
  badge,
  highlight,
  onSelect,
}: {
  amount: number;
  subtitle: string;
  bullets: string[];
  badge?: string;
  highlight?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 transition-all md:p-7",
        highlight
          ? "border-charcoal shadow-lg ring-2 ring-charcoal/5"
          : "border-black/10 hover:border-charcoal/30 hover:shadow-sm"
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-charcoal px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-white">
          {badge}
        </span>
      )}
      <span className="text-label">{subtitle}</span>
      <span className="mt-3 text-4xl font-light text-charcoal md:text-5xl">
        {amount} <span className="text-base text-warm-gray align-middle">PLN/m</span>
      </span>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[13px] text-charcoal/80">
            <CheckMark />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <button onClick={onSelect} className="btn-cta mt-auto w-full justify-center !mt-7">
        Wybierz pakiet
      </button>
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-charcoal">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  isLast,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div className={cn(!isLast && "border-b border-black/10")}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-medium text-charcoal">{question}</span>
        {isOpen ? (
          <MinusIcon className="h-4 w-4 shrink-0 text-charcoal" />
        ) : (
          <PlusIcon className="h-4 w-4 shrink-0 text-charcoal" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <p className="px-6 pb-5 text-[13px] leading-relaxed text-warm-gray">{answer}</p>
      </div>
    </div>
  );
}

function CategoryMockup({ categoryLabel, sellerName }: { categoryLabel: string; sellerName: string }) {
  const cards = [
    { tone: "from-amber-200 to-amber-50", name: "Twoj produkt", price: "189 zl", seller: sellerName, promoted: true },
    { tone: "from-slate-300 to-slate-100", name: "Classic Runner", price: "229 zl", seller: "SportPeak" },
    { tone: "from-stone-300 to-stone-100", name: "Daily Walker", price: "179 zl", seller: "EcoThreads" },
    { tone: "from-zinc-300 to-zinc-100", name: "Trail Pacer", price: "259 zl", seller: "UrbanEdge" },
    { tone: "from-neutral-300 to-neutral-100", name: "City Slip-on", price: "199 zl", seller: "Bella Donna" },
    { tone: "from-rose-200 to-rose-50", name: "Soft Loafer", price: "249 zl", seller: "Classic Fit" },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
      {/* fake browser bar */}
      <div className="flex items-center gap-2 border-b border-black/5 bg-cream-light/60 px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-warm-gray">
          fashionhero.shop/collections/{categoryLabel.toLowerCase()}
        </div>
      </div>

      {/* fake category page */}
      <div className="px-5 py-5 md:px-7 md:py-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-label">Kategoria</p>
            <h3 className="text-lg font-light text-charcoal md:text-xl">{categoryLabel}</h3>
          </div>
          <span className="text-[11px] text-warm-gray">128 produktow</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {cards.map((card, i) => (
            <MockProductCard
              key={i}
              position={i + 1}
              tone={card.tone}
              name={card.name}
              price={card.price}
              seller={card.seller}
              promoted={card.promoted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MockProductCard({
  position,
  tone,
  name,
  price,
  seller,
  promoted,
}: {
  position: number;
  tone: string;
  name: string;
  price: string;
  seller: string;
  promoted?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white p-2.5 transition-all",
        promoted ? "border-charcoal shadow-lg ring-2 ring-amber-400/30" : "border-black/10"
      )}
    >
      {promoted && (
        <span className="absolute -top-3 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-charcoal px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.6px] text-white shadow">
          <StarIcon className="h-3 w-3 text-amber-300" filled /> Promowane
        </span>
      )}
      <span className="absolute right-2.5 top-2.5 z-10 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-warm-gray">
        #{position}
      </span>
      <div className={cn("relative mb-2 aspect-square overflow-hidden rounded-lg bg-gradient-to-br", tone)}>
        <div className="absolute inset-x-3 bottom-3 h-3 rounded-full bg-black/10 blur-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn("h-2/5 w-3/5 rounded-[40%_60%_30%_70%]", promoted ? "bg-amber-400/50" : "bg-black/10")} />
        </div>
      </div>
      <p className={cn("text-[11px] font-medium uppercase tracking-wide", promoted ? "text-charcoal" : "text-charcoal/80")}>
        {name}
      </p>
      <p className="text-[10px] text-warm-gray">Sold by {seller}</p>
      <p className="mt-1 text-[12px] font-medium text-charcoal">{price}</p>
    </div>
  );
}
