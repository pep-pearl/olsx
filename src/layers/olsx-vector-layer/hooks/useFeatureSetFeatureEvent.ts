import type { MapBrowserEvent } from "ol";
import type { FeatureLike } from "ol/Feature";
import { useCallback, useEffect, useRef } from "react";
import { FEATURE_DATA_KEY } from "../../../core/constants";
import { useMapRefsContext } from "../../../core/model/context";
import { findFeatureAtEvent } from "../../../core/utils/olUtils";
import { isFeatureSetFeature } from "../../../core/utils/olsxUtils";
import { useVectorLayerContext } from "../model/vectorLayerContext";

function useIsFeatureSetFeature(id: string, type: string) {
  return useCallback(
    (feat: FeatureLike) => isFeatureSetFeature(feat, id, type),
    [id, type],
  );
}

export function useFeatureSetFeatureSingleclick<
  TType extends string,
  TData extends object,
>(
  type: TType,
  onClick: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, sourceRegistryRef } = useMapRefsContext();
  const { id } = useVectorLayerContext();

  const predicate = useIsFeatureSetFeature(id, type);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !sourceRegistryRef || !onClick) return;

    const sourceRegistry = sourceRegistryRef.current;

    if (!sourceRegistry.has(id)) {
      console.warn(
        `Layer with id "${id}" does not have a source in source registry. Click handler will not be set.`,
      );
      return;
    }

    const handleClick = (event: MapBrowserEvent) => {
      const feature = findFeatureAtEvent(map, event, predicate);
      if (!feature) return;

      const item = feature.get(FEATURE_DATA_KEY) as TData | undefined;
      if (!item) return;

      onClick(item, feature);
    };

    map.on("singleclick", handleClick);

    return () => {
      map.un("singleclick", handleClick);
    };
  }, [mapRef, sourceRegistryRef, id, type, onClick, predicate]);
}
export function useFeatureSetFeaturePointermove<
  TType extends string,
  TData extends object,
>(
  type: TType,
  onHover: ((item: TData, feature: FeatureLike) => void) | undefined,
) {
  const { mapRef, sourceRegistryRef } = useMapRefsContext();
  const { id } = useVectorLayerContext();

  const predicate = useIsFeatureSetFeature(id, type);

  const lastHoveredFeatureRef = useRef<FeatureLike | null>(null);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map || !sourceRegistryRef || !onHover) return;

    const sourceRegistry = sourceRegistryRef.current;

    if (!sourceRegistry.has(id)) {
      console.warn(
        `Layer with id "${id}" does not have a source in source registry. Hover handler will not be set.`,
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

      const item = feature.get(FEATURE_DATA_KEY) as TData | undefined;
      if (!item) return;

      onHover(item, feature);
    };

    map.on("pointermove", handlePointerMove);

    return () => {
      map.un("pointermove", handlePointerMove);
    };
  }, [mapRef, sourceRegistryRef, id, type, onHover, predicate]);
}
