import { useEffect, useRef } from "react";
import { useVectorLayerContext } from "./vectorLayerContext";
import {
  removeFeatures,
  type FeatureDiffState,
  upsertFeatures,
} from "./featuresDiff";
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
  const featuresByIdRef = useRef<FeatureDiffState>(new Map());

  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) {
      console.warn(
        `Layer with id "${layerId}" does not have a vector source. Features with id "${featuresId}" will not be set.`,
      );
      return;
    }
    const featuresRegistry = featuresRegistryRef.current;

    const features = upsertFeatures({
      data,
      getGeometry,
      getId,
      layerId,
      featuresId,
      type,
      vectorSource,
      featuresById: featuresByIdRef.current,
    });

    featuresRegistry.set(featuresId, features);
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

  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    const featuresById = featuresByIdRef.current;
    const featuresRegistry = featuresRegistryRef.current;

    return () => {
      if (vectorSource) {
        removeFeatures(vectorSource, featuresById);
      } else {
        featuresById.clear();
      }
      featuresRegistry.delete(featuresId);
    };
  }, [featuresId, featuresRegistryRef, vectorSourceRef]);
}
