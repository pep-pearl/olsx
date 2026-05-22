import type { FeatureLike } from "ol/Feature";
import {
  FEATURE_DATA_KEY,
  FEATURE_SET_LAYER_ID_KEY,
  FEATURE_SET_TYPE_KEY,
} from "./constants";

export type GettableFeature = FeatureLike & {
  get: (key: string) => unknown;
};

export function isGettableFeature(
  feature: FeatureLike,
): feature is GettableFeature {
  return "get" in feature;
}

export function isFeatureSetFeature(
  feature: FeatureLike,
  layerId: string,
  type: string,
): feature is GettableFeature {
  if (!isGettableFeature(feature)) return false;

  return (
    feature.get(FEATURE_SET_LAYER_ID_KEY) === layerId &&
    feature.get(FEATURE_SET_TYPE_KEY) === type &&
    Boolean(feature.get(FEATURE_DATA_KEY))
  );
}
