import TileLayer from "ol/layer/Tile";
import type { XYZ } from "ol/source";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useBaseLayerContext,
  useMapRefsContext,
} from "../../../core/model/context";
import type { BaseLayerType } from "../../../core/types";
import { createBaseSource } from "../../../core/utils/createBaseLayer";

export function useBaseLayer(defaultType: BaseLayerType) {
  const { mapRef } = useMapRefsContext();
  const { baseLayerType, setBaseLayerType } = useBaseLayerContext();
  const [isBaseLayerReady, setIsBaseLayerReady] = useState(false);
  const cacheLayerRef = useRef<Map<BaseLayerType, TileLayer<XYZ>>>(new Map());

  const getOrCreateBaseLayer = useCallback((type: BaseLayerType) => {
    const cachedLayer = cacheLayerRef.current.get(type);

    if (cachedLayer) {
      return cachedLayer;
    }

    const baseLayer = new TileLayer({
      source: createBaseSource(type),
    });

    baseLayer.set("role", "base");
    baseLayer.setZIndex(-100);

    cacheLayerRef.current.set(type, baseLayer);

    return baseLayer;
  }, []);

  const changeBaseLayer = useCallback(
    (type: BaseLayerType) => {
      const map = mapRef.current;
      if (!map) return;
      if (type === baseLayerType && cacheLayerRef.current.has(type)) return;

      const nextBaseLayer = getOrCreateBaseLayer(type);
      const layers = map.getLayers();
      const layerArray = layers.getArray();

      const isSameType = baseLayerType === type;
      const isAlreadyMounted = layerArray.includes(nextBaseLayer);

      if (isSameType && isAlreadyMounted) return;

      if (!isAlreadyMounted) {
        layers.insertAt(0, nextBaseLayer);
      }

      const layersToRemove = layers
        .getArray()
        .filter(
          (layer) => layer.get("role") === "base" && layer !== nextBaseLayer,
        );

      layersToRemove.forEach((layer) => {
        map.removeLayer(layer);
      });

      setIsBaseLayerReady(true);
      setBaseLayerType(type);
    },
    [getOrCreateBaseLayer, mapRef, baseLayerType, setBaseLayerType],
  );

  useEffect(() => {
    const cachedLayer = cacheLayerRef.current;
    const map = mapRef.current;

    if (!baseLayerType && !defaultType) return;
    changeBaseLayer(baseLayerType ?? defaultType);

    return () => {
      if (!map) return;

      cachedLayer.forEach((layer) => {
        if (map.getLayers().getArray().includes(layer)) {
          map.removeLayer(layer);
        }
      });

      cachedLayer.clear();
    };
  }, [mapRef, changeBaseLayer, baseLayerType, setBaseLayerType, defaultType]);

  const toggleBaseLayerType = useCallback(() => {
    const currentType = baseLayerType ?? defaultType;

    const nextType: BaseLayerType =
      currentType === "street" ? "satellite" : "street";

    changeBaseLayer(nextType);
  }, [changeBaseLayer, defaultType, baseLayerType]);

  return { isBaseLayerReady, toggleBaseLayerType };
}
