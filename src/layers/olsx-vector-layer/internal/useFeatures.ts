import Feature from "ol/Feature";
import { useEffect } from "react";
import {
  FEATURE_GROUP_ID_KEY,
  FEATURE_ID_KEY,
  FEATURE_PROPERTIES_KEY,
  FEATURE_LAYER_ID_KEY,
  FEATURE_TYPE_KEY,
} from "../../../core/constants";
import { useVectorLayerContext } from "./vectorLayerContext";
import type { FeaturesProps } from "../types";

export function useFeatures<
  TType extends string,
  TData extends object,
>({
  data,
  getGeometry,
  getId,
  id: featuresId,
  type,
}: Pick<
  FeaturesProps<TType, TData>,
  "data" | "getGeometry" | "getId" | "id" | "type"
>) {
  const { id: layerId, vectorSourceRef, featuresRegistryRef } =
    useVectorLayerContext();

  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) {
      console.warn(
        `Layer with id "${layerId}" does not have a vector source. Features with id "${featuresId}" will not be set.`,
      );
      return;
    }
    const featuresRegistry = featuresRegistryRef.current;

    const features = data.map((item) => {
      const featureId = getId(item);
      const feature = new Feature({
        geometry: getGeometry(item),
        type,
        [FEATURE_ID_KEY]: featureId,
        [FEATURE_GROUP_ID_KEY]: featuresId,
        [FEATURE_LAYER_ID_KEY]: layerId,
        [FEATURE_TYPE_KEY]: type,
        [FEATURE_PROPERTIES_KEY]: item,
      });

      feature.setId(featureId);

      return feature;
    });

    vectorSource.addFeatures(features);
    featuresRegistry.set(featuresId, features);

    return () => {
      features.forEach((feature) => {
        vectorSource.removeFeature(feature);
      });
      featuresRegistry.delete(featuresId);
    };
  }, [
    data,
    featuresId,
    featuresRegistryRef,
    getGeometry,
    getId,
    layerId,
    type,
    vectorSourceRef,
  ]);
}
