/**
 * @ai-purpose Manages diffing and upserting data changes to OpenLayers features without full recreations.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends Feature, olsx constants
 * @ai-used-by useFeatures hook
 * @ai-keywords diff, upsertFeatures, removeFeatures, vectorSource, identity
 */

import Feature from "ol/Feature";
import type { Geometry } from "ol/geom";
import {
  FEATURE_GROUP_ID_KEY,
  FEATURE_ID_KEY,
  FEATURE_LAYER_ID_KEY,
  FEATURE_PROPERTIES_KEY,
  FEATURE_TYPE_KEY,
} from "../../../core/constants";

type VectorSourceLike = {
  addFeature: (feature: Feature) => void;
  removeFeature: (feature: Feature) => void;
};

export type FeatureDiffState = Map<string, Feature>;

type FeaturePropertyValue = string | object;

type FeatureProperties = Record<string, FeaturePropertyValue>;

export type UpsertFeaturesOptions<
  TType extends string,
  TData extends object,
> = {
  data: TData[];
  getGeometry: (item: TData) => Geometry;
  getId: (item: TData) => string;
  layerId: string;
  featuresId: string;
  featureType: TType;
  vectorSource: VectorSourceLike;
  featuresById: FeatureDiffState;
};

function createFeature<TType extends string, TData extends object>({
  featureId,
  item,
  geometry,
  layerId,
  featuresId,
  featureType,
}: {
  featureId: string;
  item: TData;
  geometry: Geometry;
  layerId: string;
  featuresId: string;
  featureType: TType;
}) {
  const feature = new Feature({
    geometry,
    featureType,
    [FEATURE_ID_KEY]: featureId,
    [FEATURE_GROUP_ID_KEY]: featuresId,
    [FEATURE_LAYER_ID_KEY]: layerId,
    [FEATURE_TYPE_KEY]: featureType,
    [FEATURE_PROPERTIES_KEY]: item,
  });

  feature.setId(featureId);

  return feature;
}

function getFeatureProperties<TType extends string, TData extends object>({
  featureId,
  item,
  layerId,
  featuresId,
  featureType,
}: {
  featureId: string;
  item: TData;
  layerId: string;
  featuresId: string;
  featureType: TType;
}): FeatureProperties {
  return {
    featureType,
    [FEATURE_ID_KEY]: featureId,
    [FEATURE_GROUP_ID_KEY]: featuresId,
    [FEATURE_LAYER_ID_KEY]: layerId,
    [FEATURE_TYPE_KEY]: featureType,
    [FEATURE_PROPERTIES_KEY]: item,
  };
}

function hasPropertiesChanged(feature: Feature, properties: FeatureProperties) {
  return Object.entries(properties).some(
    ([key, value]) => feature.get(key) !== value,
  );
}

function updateFeature<TType extends string, TData extends object>({
  feature,
  featureId,
  item,
  geometry,
  layerId,
  featuresId,
  featureType,
}: {
  feature: Feature;
  featureId: string;
  item: TData;
  geometry: Geometry;
  layerId: string;
  featuresId: string;
  featureType: TType;
}) {
  const properties = getFeatureProperties({
    featureId,
    item,
    layerId,
    featuresId,
    featureType,
  });
  const propertiesChanged = hasPropertiesChanged(feature, properties);
  const geometryChanged = feature.getGeometry() !== geometry;

  if (!propertiesChanged && !geometryChanged) return;

  if (propertiesChanged) {
    feature.setProperties(properties, true);
  }

  if (geometryChanged) {
    feature.setGeometry(geometry);
    return;
  }

  feature.changed();
}

export function upsertFeatures<TType extends string, TData extends object>({
  data,
  getGeometry,
  getId,
  layerId,
  featuresId,
  featureType,
  vectorSource,
  featuresById,
}: UpsertFeaturesOptions<TType, TData>) {
  const nextIds = new Set<string>();

  data.forEach((item) => {
    const featureId = getId(item);
    nextIds.add(featureId);

    const geometry = getGeometry(item);
    const existingFeature = featuresById.get(featureId);

    if (existingFeature) {
      updateFeature({
        feature: existingFeature,
        featureId,
        item,
        geometry,
        layerId,
        featuresId,
        featureType,
      });
      return;
    }

    const feature = createFeature({
      featureId,
      item,
      geometry,
      layerId,
      featuresId,
      featureType,
    });

    featuresById.set(featureId, feature);
    vectorSource.addFeature(feature);
  });

  for (const [featureId, feature] of featuresById) {
    if (nextIds.has(featureId)) continue;

    vectorSource.removeFeature(feature);
    featuresById.delete(featureId);
  }

  return Array.from(featuresById.values());
}

export function removeFeatures(
  vectorSource: VectorSourceLike,
  featuresById: FeatureDiffState,
) {
  featuresById.forEach((feature) => {
    vectorSource.removeFeature(feature);
  });
  featuresById.clear();
}
