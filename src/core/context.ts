// context.ts
import type { Map as OlMap } from "ol";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";
import type { Style } from "ol/style";
import { createContext, type RefObject, useContext } from "react";
import type { BaseLayerType } from "./types";

export type StyleCacheValue = Style | Style[];
export type LayerStyleCache = Map<string, StyleCacheValue>;

type MapContextType = {
  mapRef: RefObject<OlMap | null>;
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

type BaseLayerContext = {
  baseLayerType: BaseLayerType | null;
  setBaseLayerType: (type: BaseLayerType) => void;
};

export const BaseLayerContext = createContext<BaseLayerContext | null>(null);

export function useBaseLayerContext() {
  const context = useContext(BaseLayerContext);

  if (!context) {
    throw new Error("useBaseLayerContext must be used within BaseLayer");
  }

  return context;
}
