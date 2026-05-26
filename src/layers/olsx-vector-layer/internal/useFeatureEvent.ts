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
  EVENT_TYPE_POINTERMOVE,
  EVENT_TYPE_SINGLECLICK,
  FEATURE_PROPERTIES_KEY,
} from "../../../core/constants";
import {
  registerMapListener,
  type MapEventTarget,
} from "../../../core/listeners/listenerRegistry";
import { useMapRefsContext } from "../../../core/model/context";
import { buildListenerKey, isFeature } from "../../../core/utils/olsxUtils";
import { findFeatureAtEvent } from "../../../core/utils/olUtils";
import { useVectorLayerContext } from "../internal/vectorLayerContext";

function useIsFeature(layerId: string) {
  return useCallback(
    (feat: FeatureLike) => isFeature(feat, layerId),
    [layerId],
  );
}

export function useFeatureSingleclick<TData extends object>(
  featureId: string,
  onClick: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, listenerRegistryRef } = useMapRefsContext();
  const { id: layerId, vectorSourceRef } = useVectorLayerContext();

  const predicate = useCallback(
    (feature: FeatureLike): feature is Feature => isFeature(feature, layerId),
    [layerId],
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
      buildListenerKey(layerId, featureId, EVENT_TYPE_SINGLECLICK),
      EVENT_TYPE_SINGLECLICK,
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

export function useFeaturePointermove<TData extends object>(
  featureId: string,
  onHover: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, listenerRegistryRef } = useMapRefsContext();
  const { id: layerId, vectorSourceRef } = useVectorLayerContext();

  const predicate = useIsFeature(layerId);

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
      buildListenerKey(layerId, featureId, EVENT_TYPE_POINTERMOVE),
      EVENT_TYPE_POINTERMOVE,
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
