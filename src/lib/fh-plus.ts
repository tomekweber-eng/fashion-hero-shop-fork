import posthog from "posthog-js";
import { track } from "./analytics";

export type BuyerSegment = "new" | "occasional" | "heavy";

export interface BuyerProfile {
  buyer_id: string;
  buyer_segment: BuyerSegment;
  purchase_count_30d: number;
}

export const FLAG_KEY = "fh_plus_fakedoor_v1";

export const PLANS = [
  { price: 29, label: "Starter" },
  { price: 49, label: "Plus", badge: "Najczęściej wybierane" as const },
  { price: 79, label: "Pro" },
] as const;

export type PlanPrice = (typeof PLANS)[number]["price"];

const BUYER_ID_KEY = "fh_buyer_id";
const PURCHASE_COUNT_KEY = "fh_purchase_count_30d";
const BANNER_SEEN_KEY = "fh_plus_banner_seen_at";
const AUTH_USER_KEY = "stepforward_user";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function generateUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `fh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function hashToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function segmentFromCount(count: number): BuyerSegment {
  if (count === 0) return "new";
  if (count <= 2) return "occasional";
  return "heavy";
}

export function getBuyerProfile(): BuyerProfile | null {
  if (typeof window === "undefined") return null;

  let buyerId: string | null = null;
  try {
    const storedAuth = localStorage.getItem(AUTH_USER_KEY);
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth) as { email?: string };
      if (parsed?.email) buyerId = parsed.email;
    }
  } catch {
    // ignore
  }

  if (!buyerId) {
    buyerId = localStorage.getItem(BUYER_ID_KEY);
    if (!buyerId) {
      buyerId = generateUuid();
      localStorage.setItem(BUYER_ID_KEY, buyerId);
    }
  }

  let countRaw = localStorage.getItem(PURCHASE_COUNT_KEY);
  let count: number;
  if (countRaw === null) {
    count = hashToInt(buyerId) % 6;
    localStorage.setItem(PURCHASE_COUNT_KEY, String(count));
  } else {
    const parsed = parseInt(countRaw, 10);
    count = Number.isFinite(parsed) ? parsed : 0;
  }

  return {
    buyer_id: buyerId,
    buyer_segment: segmentFromCount(count),
    purchase_count_30d: count,
  };
}

export function hasSeenBanner(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(BANNER_SEEN_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < THIRTY_DAYS_MS;
}

export function markBannerSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BANNER_SEEN_KEY, String(Date.now()));
}

export function isFlagEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const phFlag = posthog.isFeatureEnabled(FLAG_KEY);
    if (phFlag === true) return true;
    if (phFlag === false) return false;
  } catch {
    // posthog not initialized
  }
  return process.env.NEXT_PUBLIC_FH_PLUS_ENABLED === "true";
}

type FhPlusEvent = "banner_view" | "banner_click" | "plan_select" | "plan_dismiss";

type ExtraProps = Record<string, string | number | boolean>;

export function trackFhPlus(event: FhPlusEvent, extra?: ExtraProps): void {
  const profile = getBuyerProfile();
  if (!profile) return;
  track(event, { ...profile, ...extra });
}
