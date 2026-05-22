/**
 * @ai-purpose React wrapper for an OpenLayers vector layer and its typed feature-set children.
 * @ai-entry true
 * @ai-domain gis
 * @ai-depends OLSXMap registry context, VectorLayerContext, vector style cache utilities.
 * @ai-used-by OLSXVectorLayer compound API and createVectorLayer typed factory.
 * @ai-keywords OLSXVectorLayer, VectorLayerProps, VectorLayerRef, style, cacheStyle, types.
 * @ai-notes Keep OpenLayers layer lifecycle separate from FeatureSet data/source lifecycle.
 */

import type { FeatureLike } from "ol/Feature";
import OlVectorLayer from "ol/layer/Vector";
import type { Style } from "ol/style";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useMapContext } from "../../core/context";
import { getFeatureStyleCacheKey } from "./styleCache";
import { VectorLayerContext } from "./vectorLayerContext";

type VectorStyleResult = Style | Style[] | void;

export type VectorLayerProps<
  TTypes extends readonly string[] = readonly string[],
> = {
  id: string;
  types?: TTypes;
  style?: (feature: FeatureLike, type?: TTypes[number]) => VectorStyleResult;
  children?: React.ReactNode;
  cacheStyle?: boolean;
};

export type VectorLayerRef = {
  getLayer: () => OlVectorLayer | null;
  isVectorLayerReady: boolean;
};

function VectorLayer<TTypes extends readonly string[] = readonly string[]>(
  { id, types, children, style, cacheStyle = true }: VectorLayerProps<TTypes>,
  ref: React.ForwardedRef<VectorLayerRef>,
) {
  const [isVectorLayerReady, setIsVectorLayerReady] = useState(false);
  const { mapRef, layerRegistryRef } = useMapContext();
  const vectorLayerRef = useRef<OlVectorLayer | null>(null);
  const styleCacheRef = useRef<Map<string, VectorStyleResult>>(new Map());

  useEffect(() => {
    if (!mapRef.current || !layerRegistryRef.current) return;
    const layerRegistry = layerRegistryRef.current;
    if (layerRegistry.has(id)) {
      console.warn(`Layer with id "${id}" already exists. Skipping creation.`);
      return;
    }

    const map = mapRef.current;
    const vectorLayer = new OlVectorLayer();

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

  useImperativeHandle(
    ref,
    () => ({
      getLayer: () => vectorLayerRef.current,
      isVectorLayerReady,
    }),
    [isVectorLayerReady],
  );

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

  return (
    <VectorLayerContext.Provider value={{ id, types: types ?? [] }}>
      {isVectorLayerReady && children}
    </VectorLayerContext.Provider>
  );
}

export const OLSXVectorLayer = forwardRef(VectorLayer) as typeof VectorLayer;
