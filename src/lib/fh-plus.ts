import posthog from "posthog-js";
import { track } from "./analytics";

export const FLAG_KEY = "fh_plus_fakedoor_v1";

export const BUNDLE = [
  "Free returns bez limitu",
  "Next day delivery",
  "Early access do dropów (24h wcześniej)",
  "Okazjonalny cashback",
] as const;

export const PLANS = [
  {
    price: 29,
    label: "Starter",
    benefits: ["Free returns bez limitu", "Cashback 1%"],
  },
  {
    price: 49,
    label: "Plus",
    benefits: ["Free returns bez limitu", "Cashback 2%", "Next day delivery"],
  },
  {
    price: 79,
    label: "Pro",
    benefits: [
      "Free returns bez limitu",
      "Cashback 3%",
      "Next day delivery",
      "Early access do dropów (24h wcześniej)",
    ],
  },
] as const;

export type PlanPrice = (typeof PLANS)[number]["price"];

const BUYER_ID_KEY = "fh_buyer_id";
const BANNER_SEEN_KEY = "fh_plus_banner_seen_at";
const AUTH_USER_KEY = "stepforward_user";
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

function generateUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `fh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface BuyerIdentity {
  buyer_id: string;
  is_identified: boolean;
}

export function getBuyerIdentity(): BuyerIdentity | null {
  if (typeof window === "undefined") return null;

  try {
    const storedAuth = localStorage.getItem(AUTH_USER_KEY);
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth) as { email?: string };
      if (parsed?.email) {
        return { buyer_id: parsed.email, is_identified: true };
      }
    }
  } catch {
    // ignore
  }

  let anon = localStorage.getItem(BUYER_ID_KEY);
  if (!anon) {
    anon = generateUuid();
    localStorage.setItem(BUYER_ID_KEY, anon);
  }
  return { buyer_id: anon, is_identified: false };
}

function bannerSeenKey(buyerId: string): string {
  return `${BANNER_SEEN_KEY}:${buyerId}`;
}

export function hasSeenBanner(buyerId: string): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(bannerSeenKey(buyerId));
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < SIXTY_DAYS_MS;
}

export function markBannerSeen(buyerId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(bannerSeenKey(buyerId), String(Date.now()));
}

export function isFlagEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_FH_PLUS_ENABLED === "false") return false;
  try {
    if (posthog.isFeatureEnabled(FLAG_KEY) === false) return false;
  } catch {
    // posthog not initialized — ignore, default to enabled
  }
  return true;
}

type FhPlusEvent =
  | "fh_plus_banner_click"
  | "fh_plus_plan_click"
  | "fh_plus_commit_logged_in"
  | "fh_plus_commit_anon";

type ExtraProps = Record<string, string | number | boolean>;

export function trackFhPlus(event: FhPlusEvent, extra?: ExtraProps): void {
  track(event, extra);
}
