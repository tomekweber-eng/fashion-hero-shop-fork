export type PilotCategory = "shoes" | "bags";

export type PromotionPackage = "49" | "199" | "custom";

export interface PromotionSelection {
  package: PromotionPackage;
  customAmount?: number;
}
