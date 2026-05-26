/**
 * @ai-purpose Utility functions for checking and identifying OpenLayers features within the OLSX context.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends FeatureLike, OLSX constants
 * @ai-used-by Event hooks (useFeatureEvent, useFeaturesEvent)
 * @ai-keywords isFeature, isFeatureInFeatures, isGettableFeature, buildListenerKey, getListenerKey
 */

import type { FeatureLike } from "ol/Feature";
import {
  FEATURE_GROUP_ID_KEY,
  FEATURE_ID_KEY,
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
  featureType: string,
): feature is GettableFeature {
  if (!isGettableFeature(feature)) return false;

  return (
    feature.get(FEATURE_LAYER_ID_KEY) === layerId &&
    feature.get(FEATURE_GROUP_ID_KEY) === featuresId &&
    feature.get(FEATURE_TYPE_KEY) === featureType &&
    Boolean(feature.get(FEATURE_PROPERTIES_KEY))
  );
}

export function isFeature(
  feature: FeatureLike,
  layerId: string,
): feature is GettableFeature {
  if (!isGettableFeature(feature)) return false;

  return (
    feature.get(FEATURE_LAYER_ID_KEY) === layerId &&
    Boolean(feature.get(FEATURE_PROPERTIES_KEY))
  );
}

export function isSingleFeature(
  feature: FeatureLike,
  layerId: string,
  featureId: string,
): feature is GettableFeature {
  if (!isFeature(feature, layerId)) return false;

  return (
    feature.get(FEATURE_ID_KEY) === featureId &&
    !feature.get(FEATURE_GROUP_ID_KEY)
  );
}

export function buildListenerKey(
  layerId: string,
  featureOrFeaturesId: string,
  eventType: string,
) {
  return `${layerId}:${featureOrFeaturesId}:${eventType}`;
}

export function buildDrawListenerKey(drawId: string, eventType: string) {
  return `draw:${drawId}:${eventType}`;
}

export function getListenerKey(
  feature: FeatureLike & {
    [FEATURE_GROUP_ID_KEY]?: string;
    [FEATURE_ID_KEY]?: string;
    [FEATURE_LAYER_ID_KEY]?: string;
  },
  eventType: string,
) {
  if (!isGettableFeature(feature)) return;

  const layerId = feature.get(FEATURE_LAYER_ID_KEY);
  const featureOrFeaturesId =
    feature.get(FEATURE_GROUP_ID_KEY) ?? feature.get(FEATURE_ID_KEY);

  if (!layerId || !featureOrFeaturesId) return;

  return `${layerId}:${featureOrFeaturesId}:${eventType}`;
}
