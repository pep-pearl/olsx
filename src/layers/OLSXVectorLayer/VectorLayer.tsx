import { getUid } from "ol";
import type { FeatureLike } from "ol/Feature";
import OlVectorLayer from "ol/layer/Vector";
import type { Style } from "ol/style";
import { useEffect, useRef, useState } from "react";
import { useMapContext } from "../../core/context";
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

function getFeatureStyleCacheKey(feature: FeatureLike, type?: string) {
  const featureId =
    typeof feature.getId === "function" ? feature.getId() : undefined;

  return [featureId ?? getUid(feature), type ?? ""].join(":");
}

export function OLSXVectorLayer<
  TTypes extends readonly string[] = readonly string[],
>({ id, types, children, style, cacheStyle = true }: VectorLayerProps<TTypes>) {
  const [isVectorLayerReady, setIsVectorLayerReady] = useState(false);
  const { mapRef, layerRegistryRef } = useMapContext();
  const vectorLayerRef = useRef<OlVectorLayer | null>(null);
  const styleCacheRef = useRef<Map<string, VectorStyleResult>>(new Map());

  useEffect(() => {
    if (!mapRef?.current || !layerRegistryRef?.current) return;
    const layerRegistry = layerRegistryRef?.current;
    if (layerRegistry?.has(id)) {
      console.warn(`Layer with id "${id}" already exists. Skipping creation.`);
      return;
    }

    const map = mapRef.current;
    const vectorLayer = new OlVectorLayer();

    map.addLayer(vectorLayer);
    layerRegistry?.set(id, vectorLayer);
    setIsVectorLayerReady(true);
    vectorLayerRef.current = vectorLayer;

    return () => {
      map.removeLayer(vectorLayer);
      layerRegistry?.delete(id);
      setIsVectorLayerReady(false);
      vectorLayerRef.current = null;
    };
  }, [mapRef, layerRegistryRef, id]);

  useEffect(() => {
    const layer = vectorLayerRef.current;

    if (!layer) return;

    /**
     * style 함수 자체가 바뀌면 기존 캐시는 버린다.
     * selectedId, theme, hoverId 같은 값이 useCallback deps로 들어가 있으면
     * style 함수 identity가 바뀌고 여기서 캐시가 초기화됨.
     */
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
