/**
 * @ai-purpose React hook managing OpenLayers VectorLayer lifecycle and style resolution with caching.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends useMountLayer, mapRefsContext, getFeatureStyleCacheKey
 * @ai-used-by OLSXVectorLayer component
 * @ai-keywords useOLSXVectorLayer, VectorLayer, styleCache, setStyle
 */

import VectorLayer from "ol/layer/Vector";
import type { Style } from "ol/style";
import { useEffect, useRef } from "react";
import { useMountLayer } from "../../../core/hooks/useMountLayer";
import { useMapRefsContext } from "../../../core/model/context";
import type { OLSXVectorLayerProps } from "../types";
import { getFeatureStyleCacheKey } from "./styleCache";

type VectorStyleResult = Style | Style[] | void;

export function useOLSXVectorLayer<TTypes extends readonly string[]>({
  id,
  style,
  cacheStyle,
}: OLSXVectorLayerProps<TTypes>) {
  const { listenerRegistryRef } = useMapRefsContext();
  const styleCacheRef = useRef<Map<string, VectorStyleResult>>(new Map());

  const { isLayerReady: isVectorLayerReady, layerRef: vectorLayerRef } =
    useMountLayer<VectorLayer>(id, () => new VectorLayer());

  useEffect(() => {
    const layer = vectorLayerRef.current;

    if (!layer) return;

    styleCacheRef.current.clear();

    if (!style) {
      layer.setStyle(undefined);
      return;
    }

    const styleCache = cacheStyle ? styleCacheRef.current : undefined;

    layer.setStyle((feature) => {
      const featureType = feature.get("featureType") as TTypes[number] | undefined;

      if (!cacheStyle) {
        return style(feature, featureType);
      }

      const cacheKey = getFeatureStyleCacheKey(feature, String(featureType ?? ""));
      const cached = styleCache?.get(cacheKey);

      if (cached !== undefined) {
        return cached;
      }

      const nextStyle = style(feature, featureType);

      if (nextStyle !== undefined) {
        styleCache?.set(cacheKey, nextStyle);
      }

      return nextStyle;
    });

    return () => {
      styleCache?.clear();
      layer.setStyle(undefined);
    };
  }, [style, cacheStyle, vectorLayerRef]);

  return {
    vectorLayerRef,
    isVectorLayerReady,
  };
}
