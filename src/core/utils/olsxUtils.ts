import type { FeatureLike } from "ol/Feature";
import {
  FEATURE_PROPERTIES_KEY,
  FEATURE_GROUP_ID_KEY,
  FEATURE_LAYER_ID_KEY,
  FEATURE_TYPE_KEY,
} from "../constants";

export type GettableFeature = FeatureLike & {
  get: (key: string) => unknown;
};

export function isGettableFeature(
  feature: FeatureLike,
): feature is GettableFeature {
  return "get" in feature;
}

export function isFeaturesFeature(
  feature: FeatureLike,
  layerId: string,
  featuresId: string,
  type: string,
): feature is GettableFeature {
  if (!isGettableFeature(feature)) return false;

  return (
    feature.get(FEATURE_LAYER_ID_KEY) === layerId &&
    feature.get(FEATURE_GROUP_ID_KEY) === featuresId &&
    feature.get(FEATURE_TYPE_KEY) === type &&
    Boolean(feature.get(FEATURE_PROPERTIES_KEY))
  );
}

export function isFeatureSetFeature(
  feature: FeatureLike,
  layerId: string,
  type: string,
): feature is GettableFeature {
  if (!isGettableFeature(feature)) return false;

  return (
    feature.get(FEATURE_LAYER_ID_KEY) === layerId &&
    feature.get(FEATURE_TYPE_KEY) === type &&
    Boolean(feature.get(FEATURE_PROPERTIES_KEY))
  );
}
