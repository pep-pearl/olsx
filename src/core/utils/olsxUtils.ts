/**
 * @ai-purpose Utility functions for checking and identifying OpenLayers features within the OLSX context.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends FeatureLike, OLSX constants
 * @ai-used-by Event hooks (useFeatureEvent, useFeaturesEvent)
 * @ai-keywords isFeature, isFeatureInFeatures, isGettableFeature
 */

import type { FeatureLike } from "ol/Feature";
import {
  FEATURE_GROUP_ID_KEY,
  FEATURE_LAYER_ID_KEY,
  FEATURE_PROPERTIES_KEY,
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

export function isFeatureInFeatures(
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

export function isFeature(
  feature: FeatureLike,
  layerId: string,
  featureId: string,
  type: string,
): feature is GettableFeature {
  if (!isGettableFeature(feature)) return false;

  return (
    feature.get(FEATURE_LAYER_ID_KEY) === layerId &&
    feature.get(FEATURE_TYPE_KEY) === type &&
    feature.getId() === featureId &&
    Boolean(feature.get(FEATURE_PROPERTIES_KEY))
  );
}
