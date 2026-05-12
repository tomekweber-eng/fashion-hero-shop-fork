import posthog from "posthog-js";

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, props);
  } catch {
    // posthog not initialized — silently noop
  }
}

export function identifySeller(sellerId: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  try {
    posthog.identify(sellerId, props);
  } catch {
    // noop
  }
}
