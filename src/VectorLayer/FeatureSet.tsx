import { useEffect } from "react";
import { useMapContext } from "../context";
import { useVectorLayerContext } from "./vectorLayerContext";
import { Feature } from "ol";
import type { Geometry } from "ol/geom";
import { FEATURE_DATA_KEY } from "../constants";

export type FeatureSetProps<
  TType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
> = {
  type: TType;
  getId: (item: TData) => string;
  getGeometry: (item: TData) => Geometry;
  data: Array<TData>;
};

export function FeatureSet<
  TType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
>({ type, data, getGeometry, getId }: FeatureSetProps<TType, TData>) {
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
    vectorSource?.clear();

    const features = data.map((item) => {
      const feature = new Feature({
        geometry: getGeometry(item),
        type,
        [FEATURE_DATA_KEY]: item,
      });
      feature.setId(getId(item));

      return feature;
    });

    vectorSource?.addFeatures(features);

    return () => {
      features.forEach((feature) => {
        vectorSource?.removeFeature(feature);
      });
    };
  }, [data, mapRef, sourceRegistryRef, id, getId, getGeometry, type]);

  return null;
}
