import { createContext, useContext } from "react";
import type { RefObject } from "react";
import type OlVectorSource from "ol/source/Vector";
import type { FeaturesRegistry } from "../registry/featuresRegistry";

export const VectorLayerContext = createContext<{
  id: string;
  featureTypes: readonly string[];
  vectorSourceRef: RefObject<OlVectorSource | null>;
  featuresRegistryRef: RefObject<FeaturesRegistry>;
} | null>(null);

export function useVectorLayerContext() {
  const context = useContext(VectorLayerContext);
  if (!context) {
    throw new Error("useVectorLayerContext must be used within a VectorLayer");
  }
  return context;
}
