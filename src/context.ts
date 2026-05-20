// context.ts
import { createContext, type RefObject, useContext } from "react";
import type { View, Map as OlMap } from "ol";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";
import type { Style } from "ol/style";

export type StyleCacheValue = Style | Style[];
export type LayerStyleCache = Map<string, StyleCacheValue>;

type MapContextType = {
  mapRef: RefObject<OlMap | null>;
  viewRef: RefObject<View | null>;
  baseLayerTypeRef: RefObject<"satellite" | "street" | null>;
  layerRegistryRef: RefObject<Map<string, Layer>>;
  sourceRegistryRef: RefObject<Map<string, VectorSource>>;
};

export const MapContext = createContext<MapContextType | null>(null);

export function useMapContext() {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMapContext must be used within OLXMap");
  }

  return context;
}
