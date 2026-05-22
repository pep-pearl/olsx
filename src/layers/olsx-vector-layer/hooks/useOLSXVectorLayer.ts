import VectorLayer from "ol/layer/Vector";
import type { Style } from "ol/style";
import { useEffect, useRef, useState } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import type { OLSXVectorLayerProps } from "../types";
import { getFeatureStyleCacheKey } from "../utils/styleCache";

type VectorStyleResult = Style | Style[] | void;

export function useOLSXVectorLayer<TTypes extends readonly string[]>({
  id,
  style,
  cacheStyle,
}: OLSXVectorLayerProps<TTypes>) {
  const [isVectorLayerReady, setIsVectorLayerReady] = useState(false);
  const { mapRef, layerRegistryRef } = useMapRefsContext();
  const vectorLayerRef = useRef<VectorLayer | null>(null);
  const styleCacheRef = useRef<Map<string, VectorStyleResult>>(new Map());

  useEffect(() => {
    if (!mapRef.current || !layerRegistryRef.current) return;
    const layerRegistry = layerRegistryRef.current;
    if (layerRegistry.has(id)) {
      console.warn(`Layer with id "${id}" already exists. Skipping creation.`);
      return;
    }

    const map = mapRef.current;
    const vectorLayer = new VectorLayer();

    map.addLayer(vectorLayer);
    layerRegistry.set(id, vectorLayer);
    setIsVectorLayerReady(true);
    vectorLayerRef.current = vectorLayer;

    return () => {
      map.removeLayer(vectorLayer);
      layerRegistry.delete(id);
      setIsVectorLayerReady(false);
      vectorLayerRef.current = null;
    };
  }, [mapRef, id, layerRegistryRef, setIsVectorLayerReady]);

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
      const type = feature.get("type") as TTypes[number] | undefined;

      if (!cacheStyle) {
        return style(feature, type);
      }

      const cacheKey = getFeatureStyleCacheKey(feature, String(type ?? ""));
      const cached = styleCache?.get(cacheKey);

      if (cached !== undefined) {
        return cached;
      }

      const nextStyle = style(feature, type);

      if (nextStyle !== undefined) {
        styleCache?.set(cacheKey, nextStyle);
      }

      return nextStyle;
    });

    return () => {
      styleCache?.clear();
      layer.setStyle(undefined);
    };
  }, [style, cacheStyle]);

  return {
    vectorLayerRef,
    isVectorLayerReady,
  };
}
