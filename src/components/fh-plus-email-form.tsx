"use client";

import { useState } from "react";
import { trackFhPlus, type PlanPrice } from "@/lib/fh-plus";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  planPrice: PlanPrice;
  onCommit: () => void;
}

export function FhPlusEmailForm({ planPrice, onCommit }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_REGEX.test(value)) {
      setError("Podaj poprawny adres email");
      return;
    }
    setError(null);
    trackFhPlus("fh_plus_commit_anon", { plan_price: planPrice });
    onCommit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <label className="block">
        <span className="block text-[11px] font-medium uppercase tracking-[0.6px] text-warm-gray mb-1.5">
          Twój email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="ty@example.com"
          className={`w-full border px-3 py-2.5 text-sm bg-white focus:outline-none transition-colors ${
            error ? "border-red-500 focus:border-red-600" : "border-border focus:border-charcoal"
          }`}
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? "fh-plus-email-error" : undefined}
        />
        {error && (
          <p id="fh-plus-email-error" className="mt-1.5 text-xs text-red-600">
            {error}
          </p>
        )}
      </label>
      <button
        type="submit"
        data-attr="fh-plus-submit-anon"
        className="btn-cta w-full sm:w-auto sm:min-w-[280px]"
      >
        Zarezerwuj cenę {planPrice} PLN
      </button>
      <p className="text-[11px] text-warm-gray/70">
        Bez płatności teraz · zablokujemy dostęp gdy ruszymy · email nie zostanie nigdzie odsprzedany
      </p>
    </form>
  );
}
