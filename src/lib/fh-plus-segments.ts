import posthog from "posthog-js";
import { getBuyerIdentity } from "./fh-plus";

export type Cohort = "G1" | "G2" | "G3" | "G4";

export const COHORT_LABEL: Record<Cohort, string> = {
  G1: "Pracujące",
  G2: "Łowczynie okazji",
  G3: "Premium",
  G4: "Młode trend-driven",
};

const COHORT_DISTRIBUTION: Array<{ cohort: Cohort; weight: number }> = [
  { cohort: "G1", weight: 40 },
  { cohort: "G2", weight: 30 },
  { cohort: "G3", weight: 15 },
  { cohort: "G4", weight: 15 },
];

const EXPOSED_COHORTS: ReadonlySet<Cohort> = new Set<Cohort>(["G1", "G2"]);

const OVERRIDE_QUERY = "segment";

function hashToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function cohortFromHash(buyerId: string): Cohort {
  const total = COHORT_DISTRIBUTION.reduce((a, b) => a + b.weight, 0);
  const bucket = hashToInt(buyerId) % total;
  let acc = 0;
  for (const entry of COHORT_DISTRIBUTION) {
    acc += entry.weight;
    if (bucket < acc) return entry.cohort;
  }
  return "G1";
}

function readOverride(): Cohort | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get(OVERRIDE_QUERY)?.toUpperCase();
  if (raw === "G1" || raw === "G2" || raw === "G3" || raw === "G4") {
    return raw;
  }
  return null;
}

export function getCohort(): Cohort | null {
  const identity = getBuyerIdentity();
  if (!identity) return null;
  return readOverride() ?? cohortFromHash(identity.buyer_id);
}

export function isExposedCohort(cohort: Cohort | null): cohort is "G1" | "G2" {
  if (!cohort) return false;
  return EXPOSED_COHORTS.has(cohort);
}

export function identifyForExperiment(): void {
  if (typeof window === "undefined") return;
  const identity = getBuyerIdentity();
  if (!identity) return;
  const cohort = getCohort();
  try {
    if (identity.is_identified) {
      posthog.identify(identity.buyer_id, {
        buyer_segment: cohort,
      });
    } else {
      posthog.setPersonProperties({ buyer_segment: cohort });
    }
  } catch {
    // posthog not initialized
  }
}
