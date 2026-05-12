"use client";

import { getAllSellers } from "@/data/sellers";
import { getSellerPilotCategory, PILOT_CATEGORY_LABEL } from "@/lib/seller-category";
import { useActiveSeller } from "@/hooks/use-active-seller";

export function SellerSwitcher() {
  const { sellerId, setSellerId, hydrated } = useActiveSeller();
  const sellers = getAllSellers();

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <p className="text-label mb-2">Mock login — switch seller</p>
      <div className="flex items-center gap-3">
        <select
          value={hydrated ? sellerId : ""}
          onChange={(e) => setSellerId(e.target.value)}
          className="flex-1 rounded-md border border-black/15 bg-white px-3 py-2 text-[13px] text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {sellers.map((s) => {
            const cat = getSellerPilotCategory(s.id);
            const tag = cat ? ` · ${PILOT_CATEGORY_LABEL[cat]} (pilot)` : " · non-pilot";
            return (
              <option key={s.id} value={s.id}>
                {s.name}
                {tag}
              </option>
            );
          })}
        </select>
      </div>
      <p className="mt-2 text-[11px] text-warm-gray">
        Pilot categories see the Promoted Listings banner below.
      </p>
    </div>
  );
}
