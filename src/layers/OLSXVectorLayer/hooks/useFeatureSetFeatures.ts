import Feature from "ol/Feature";
import { useEffect } from "react";
import {
  FEATURE_DATA_KEY,
  FEATURE_SET_LAYER_ID_KEY,
  FEATURE_SET_TYPE_KEY,
} from "../../../core/constants";
import { useMapContext } from "../../../core/context";
import type { FeatureSetProps } from "../types";
import { useVectorLayerContext } from "../vectorLayerContext";

export function useFeatureSetFeatures<
  TType extends string,
  TData extends object,
>({
  data,
  getGeometry,
  getId,
  type,
}: Pick<
  FeatureSetProps<TType, TData>,
  "data" | "getGeometry" | "getId" | "type"
>) {
  const { mapRef, sourceRegistryRef } = useMapContext();
  const { id } = useVectorLayerContext();

  useEffect(() => {
    if (!mapRef?.current || !sourceRegistryRef) return;

    const sourceRegistry = sourceRegistryRef.current;

    if (!sourceRegistry.has(id)) {
      console.warn(
        `Layer with id "${id}" does not have a source in source registry. Features will not be set.`,
      );
      return;
    }

    const vectorSource = sourceRegistry.get(id);
    if (!vectorSource) return;

    const features = data.map((item) => {
      const feature = new Feature({
        geometry: getGeometry(item),
        type,
        [FEATURE_SET_LAYER_ID_KEY]: id,
        [FEATURE_SET_TYPE_KEY]: type,
        [FEATURE_DATA_KEY]: item,
      });

      feature.setId(getId(item));

      return feature;
    });

    vectorSource.addFeatures(features);

    return () => {
      features.forEach((feature) => {
        vectorSource.removeFeature(feature);
      });
    };
  }, [data, mapRef, sourceRegistryRef, id, getId, getGeometry, type]);
}
