/**
 * @ai-purpose React hooks that manage singleclick and pointermove events for a single OpenLayers Feature.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends listenerRegistry, vectorLayerContext, findFeatureAtEvent
 * @ai-used-by OLSXFeature component
 * @ai-keywords useFeatureEvent, useFeatureSingleclick, useFeaturePointermove, events
 */

import { Feature, MapBrowserEvent } from "ol";
import type { FeatureLike } from "ol/Feature";
import { useCallback, useEffect, useRef } from "react";
import {
  FEATURE_LAYER_ID_KEY,
  FEATURE_PROPERTIES_KEY,
  FEATURE_TYPE_KEY,
} from "../../../core/constants";
import {
  registerMapListener,
  type MapEventTarget,
} from "../../../core/listeners/listenerRegistry";
import { useMapRefsContext } from "../../../core/model/context";
import { isFeature } from "../../../core/utils/olsxUtils";
import { findFeatureAtEvent } from "../../../core/utils/olUtils";
import { useVectorLayerContext } from "../internal/vectorLayerContext";

function useIsFeature(layerId: string, featureId: string, type: string) {
  return useCallback(
    (feat: FeatureLike) => isFeature(feat, layerId, featureId, type),
    [featureId, layerId, type],
  );
}

export function useFeatureSingleclick<
  TType extends string,
  TData extends object,
>(
  featureId: string,
  type: TType,
  onClick: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, listenerRegistryRef } = useMapRefsContext();
  const { id: layerId, vectorSourceRef } = useVectorLayerContext();

  const predicate = useCallback(
    (feature: FeatureLike): feature is Feature =>
      feature.getId() === featureId &&
      feature[FEATURE_LAYER_ID_KEY] === layerId &&
      feature[FEATURE_TYPE_KEY] === type,
    [featureId, layerId, type],
  );

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !onClick) return;

    if (!vectorSourceRef.current) {
      console.warn(
        `Layer with id "${layerId}" does not have a vector source. Click handler for features "${featureId}" will not be set.`,
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
      `feature:${layerId}:${featureId}:singleclick`,
      "singleclick",
      handleClick as (event: never) => void,
    );
  }, [
    featureId,
    layerId,
    listenerRegistryRef,
    mapRef,
    onClick,
    predicate,
    vectorSourceRef,
  ]);
}

export function useFeaturePointermove<
  TType extends string,
  TData extends object,
>(
  featureId: string,
  type: TType,
  onHover: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, listenerRegistryRef } = useMapRefsContext();
  const { id: layerId, vectorSourceRef } = useVectorLayerContext();

  const predicate = useIsFeature(layerId, featureId, type);

  const lastHoveredFeatureRef = useRef<FeatureLike | null>(null);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !onHover) return;

    if (!vectorSourceRef.current) {
      console.warn(
        `Layer with id "${layerId}" does not have a vector source. Hover handler for feature "${featureId}" will not be set.`,
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
      `feature:${layerId}:${featureId}:pointermove`,
      "pointermove",
      handlePointerMove as (event: never) => void,
    );
  }, [
    featureId,
    layerId,
    listenerRegistryRef,
    mapRef,
    onHover,
    predicate,
    vectorSourceRef,
  ]);
}
