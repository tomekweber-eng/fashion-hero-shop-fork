import type { Cohort } from "./fh-plus-segments";
import { getBuyerIdentity } from "./fh-plus";

export type AbGroup = "experimental" | "control";

const OVERRIDE_QUERY = "fhab";

function hashToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function readOverride(): AbGroup | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(OVERRIDE_QUERY)?.toLowerCase();
  if (raw === "exp" || raw === "experimental") return "experimental";
  if (raw === "ctrl" || raw === "control") return "control";
  return null;
}

export function getAbGroup(cohort: Cohort | null): AbGroup | null {
  if (!cohort) return null;
  const override = readOverride();
  if (override) return override;
  const identity = getBuyerIdentity();
  if (!identity) return null;
  return hashToInt(`${cohort}:${identity.buyer_id}`) % 2 === 0
    ? "experimental"
    : "control";
}
