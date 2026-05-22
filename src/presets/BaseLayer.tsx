/**
 * @ai-purpose Default base-map preset that mounts and toggles street/satellite tile layers.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends OLSXMap base-layer context, createBaseSource, OpenLayers TileLayer.
 * @ai-used-by Package consumers that want the built-in base layer behavior.
 * @ai-keywords BaseLayer, BaseLayerRef, street, satellite, createBaseSource, base layer.
 * @ai-notes Keep this as a replaceable preset; advanced users may implement their own base layer component.
 */

import TileLayer from "ol/layer/Tile";
import type { XYZ } from "ol/source";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useBaseLayerContext, useMapContext } from "../core/context";
import { createBaseSource } from "../core/createBaseLayer";
import type { BaseLayerType } from "../core/types";

export type BaseLayerRef = {
  isBaseLayerReady: boolean;
  toggle: () => void;
};

type BaseLayerProps = {
  defaultType?: BaseLayerType;
};

export const BaseLayer = forwardRef<BaseLayerRef, BaseLayerProps>(
  (props, ref) => {
    const { defaultType = "street" } = props;
    const { mapRef } = useMapContext();
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
        if (
          type === baseLayerType &&
          cacheLayerRef.current.has(type)
        )
          return;

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

    useImperativeHandle(
      ref,
      () => ({
        isBaseLayerReady,
        toggle: () => {
          const currentType = baseLayerType ?? defaultType;

          const nextType: BaseLayerType =
            currentType === "street" ? "satellite" : "street";

          changeBaseLayer(nextType);
        },
      }),
      [changeBaseLayer, defaultType, baseLayerType, isBaseLayerReady],
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

    return null;
  },
);
