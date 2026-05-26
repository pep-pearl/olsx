import type OlDraw from "ol/interaction/Draw";
import { createContext, useContext } from "react";
import type { ListenerRegistry } from "../../../core/listeners/listenerRegistry";

export const DrawContext = createContext<{
  id: string;
  active: boolean;
  draw: OlDraw | null;
  drawRef: React.RefObject<OlDraw | null>;
  isDrawReady: boolean;
  drawListenerRegistryRef: React.RefObject<ListenerRegistry>;
} | null>(null);

export function useDrawContext() {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error("useDrawContext must be used within a OLSXDraw");
  }
  return context;
}
