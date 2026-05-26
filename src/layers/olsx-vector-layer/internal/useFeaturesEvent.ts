import type { MapBrowserEvent } from "ol";
import type { FeatureLike } from "ol/Feature";
import { useCallback, useEffect, useRef } from "react";
import { FEATURE_PROPERTIES_KEY } from "../../../core/constants";
import {
  registerMapListener,
  type MapEventTarget,
} from "../../../core/listeners/listenerRegistry";
import { useMapRefsContext } from "../../../core/model/context";
import { findFeatureAtEvent } from "../../../core/utils/olUtils";
import { isFeaturesFeature } from "../../../core/utils/olsxUtils";
import { useVectorLayerContext } from "./vectorLayerContext";

function useIsFeaturesFeature(layerId: string, featuresId: string, type: string) {
  return useCallback(
    (feat: FeatureLike) => isFeaturesFeature(feat, layerId, featuresId, type),
    [featuresId, layerId, type],
  );
}

export function useFeaturesSingleclick<
  TType extends string,
  TData extends object,
>(
  featuresId: string,
  type: TType,
  onClick: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, listenerRegistryRef } = useMapRefsContext();
  const { id: layerId, vectorSourceRef } = useVectorLayerContext();

  const predicate = useIsFeaturesFeature(layerId, featuresId, type);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !onClick) return;

    if (!vectorSourceRef.current) {
      console.warn(
        `Layer with id "${layerId}" does not have a vector source. Click handler for features "${featuresId}" will not be set.`,
      );
      return;
    }

    const handleClick = (event: MapBrowserEvent) => {
      const feature = findFeatureAtEvent(map, event, predicate);
      if (!feature) return;

      const item = feature.get(FEATURE_PROPERTIES_KEY) as TData | undefined;
      if (!item) return;

      onClick(item, feature);
    };

    return registerMapListener(
      listenerRegistryRef.current,
      map as unknown as MapEventTarget,
      `features:${layerId}:${featuresId}:singleclick`,
      "singleclick",
      handleClick as (event: never) => void,
    );
  }, [
    featuresId,
    layerId,
    listenerRegistryRef,
    mapRef,
    onClick,
    predicate,
    vectorSourceRef,
  ]);
}
export function useFeaturesPointermove<
  TType extends string,
  TData extends object,
>(
  featuresId: string,
  type: TType,
  onHover: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, listenerRegistryRef } = useMapRefsContext();
  const { id: layerId, vectorSourceRef } = useVectorLayerContext();

  const predicate = useIsFeaturesFeature(layerId, featuresId, type);

  const lastHoveredFeatureRef = useRef<FeatureLike | null>(null);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !onHover) return;

    if (!vectorSourceRef.current) {
      console.warn(
        `Layer with id "${layerId}" does not have a vector source. Hover handler for features "${featuresId}" will not be set.`,
      );
      return;
    }

    const handlePointerMove = (event: MapBrowserEvent) => {
      if (event.dragging) return;

      const feature = findFeatureAtEvent(map, event, predicate);

      if (!feature || !("get" in feature)) {
        lastHoveredFeatureRef.current = null;
        return;
      }

      if (lastHoveredFeatureRef.current === feature) {
        return;
      }

      lastHoveredFeatureRef.current = feature;

      const item = feature.get(FEATURE_PROPERTIES_KEY) as TData | undefined;
      if (!item) return;

      onHover(item, feature);
    };

    return registerMapListener(
      listenerRegistryRef.current,
      map as unknown as MapEventTarget,
      `features:${layerId}:${featuresId}:pointermove`,
      "pointermove",
      handlePointerMove as (event: never) => void,
    );
  }, [
    featuresId,
    layerId,
    listenerRegistryRef,
    mapRef,
    onHover,
    predicate,
    vectorSourceRef,
  ]);
}
