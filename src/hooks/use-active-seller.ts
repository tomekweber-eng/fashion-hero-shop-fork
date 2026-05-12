"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllSellers } from "@/data/sellers";

const STORAGE_KEY = "fh_active_seller_id";
const DEFAULT_SELLER_ID = "s1";
const EVENT = "fh_active_seller_changed";

export function useActiveSeller() {
  const [sellerId, setSellerIdState] = useState<string>(DEFAULT_SELLER_ID);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && getAllSellers().some((s) => s.id === stored)) {
        setSellerIdState(stored);
      }
    } catch {
      // ignore
    }
    setHydrated(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setSellerIdState(detail);
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const setSellerId = useCallback((id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    setSellerIdState(id);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
  }, []);

  const seller = getAllSellers().find((s) => s.id === sellerId) ?? getAllSellers()[0];

  return { sellerId: seller.id, seller, setSellerId, hydrated };
}
