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

export type UpsertFeaturesOptions<TType extends string, TData extends object> = {
  data: TData[];
  getGeometry: (item: TData) => Geometry;
  getId: (item: TData) => string;
  layerId: string;
  featuresId: string;
  type: TType;
  vectorSource: VectorSourceLike;
  featuresById: FeatureDiffState;
};

function createFeature<TType extends string, TData extends object>({
  featureId,
  item,
  geometry,
  layerId,
  featuresId,
  type,
}: {
  featureId: string;
  item: TData;
  geometry: Geometry;
  layerId: string;
  featuresId: string;
  type: TType;
}) {
  const feature = new Feature({
    geometry,
    type,
    [FEATURE_ID_KEY]: featureId,
    [FEATURE_GROUP_ID_KEY]: featuresId,
    [FEATURE_LAYER_ID_KEY]: layerId,
    [FEATURE_TYPE_KEY]: type,
    [FEATURE_PROPERTIES_KEY]: item,
  });

  feature.setId(featureId);

  return feature;
}

export function upsertFeatures<TType extends string, TData extends object>({
  data,
  getGeometry,
  getId,
  layerId,
  featuresId,
  type,
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
      existingFeature.setGeometry(geometry);
      existingFeature.set("type", type);
      existingFeature.set(FEATURE_ID_KEY, featureId);
      existingFeature.set(FEATURE_GROUP_ID_KEY, featuresId);
      existingFeature.set(FEATURE_LAYER_ID_KEY, layerId);
      existingFeature.set(FEATURE_TYPE_KEY, type);
      existingFeature.set(FEATURE_PROPERTIES_KEY, item);
      return;
    }

    const feature = createFeature({
      featureId,
      item,
      geometry,
      layerId,
      featuresId,
      type,
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
