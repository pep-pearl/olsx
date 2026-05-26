/**
 * @ai-purpose Shared React contexts for the OpenLayers map refs, readiness, and base-layer state.
 * @ai-entry true
 * @ai-domain state
 * @ai-depends OpenLayers Map/Layer/VectorSource types and BaseLayerType.
 * @ai-used-by OLSXMap provider, BaseLayer, controls, vector layer components, feature hooks.
 * @ai-keywords MapRefsContext, MapReadyContext, useMapContext, useMapRefsContext, useMapReadyContext, BaseLayerContext.
 * @ai-notes Context shape is a core integration contract; update consumers and AI_INDEX.md together.
 */

import type { Map as OlMap, View } from "ol";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";
import type { Style } from "ol/style";
import { createContext, type RefObject, useContext } from "react";
import type { ListenerRegistry } from "../listeners/listenerRegistry";
import type { BaseLayerType } from "../types";

export type StyleCacheValue = Style | Style[];
export type LayerStyleCache = Map<string, StyleCacheValue>;

type MapRefsContextType = {
  mapRef: RefObject<OlMap | null>;
  viewRef: RefObject<View | null>;
  layerRegistryRef: RefObject<Map<string, Layer>>;
  sourceRegistryRef: RefObject<Map<string, VectorSource>>;
  listenerRegistryRef: RefObject<ListenerRegistry>;
};

type MapReadyContextType = {
  isMapReady: boolean;
};

type MapContextType = MapRefsContextType & MapReadyContextType;

export const MapRefsContext = createContext<MapRefsContextType | null>(null);
export const MapReadyContext = createContext<MapReadyContextType | null>(null);

export function useMapRefsContext() {
  const context = useContext(MapRefsContext);

  if (!context) {
    throw new Error("useMapRefsContext must be used within OLSXMap");
  }

  return context;
}

export function useMapReadyContext() {
  const context = useContext(MapReadyContext);

  if (!context) {
    throw new Error("useMapReadyContext must be used within OLSXMap");
  }

  return context;
}

export function useMapContext(): MapContextType {
  return {
    ...useMapRefsContext(),
    ...useMapReadyContext(),
  };
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
