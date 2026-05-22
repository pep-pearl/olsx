import { getUid } from "ol";
import type { FeatureLike } from "ol/Feature";

export function getFeatureStyleCacheKey(feature: FeatureLike, type?: string) {
  const featureId =
    typeof feature.getId === "function" ? feature.getId() : undefined;

  return [featureId ?? getUid(feature), type ?? ""].join(":");
}
