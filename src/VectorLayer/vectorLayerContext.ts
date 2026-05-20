import { createContext, useContext } from "react";

export const VectorLayerContext = createContext<{
  id: string;
  types: readonly string[];
} | null>(null);

export function useVectorLayerContext() {
  const context = useContext(VectorLayerContext);
  if (!context) {
    throw new Error("useVectorLayerContext must be used within a VectorLayer");
  }
  return context;
}
