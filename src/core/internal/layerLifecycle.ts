type LayerMap<TLayer> = {
  addLayer: (layer: TLayer) => void;
  removeLayer: (layer: TLayer) => void;
};

export type MountLayerOptions<TLayer> = {
  id: string;
  map: LayerMap<TLayer>;
  layerRegistry: Map<string, TLayer>;
  layerRef: { current: TLayer | null };
  createLayer: () => TLayer;
  setReady: (isReady: boolean) => void;
  warn?: (message: string) => void;
};

export function mountLayerById<TLayer>({
  id,
  map,
  layerRegistry,
  layerRef,
  createLayer,
  setReady,
  warn = console.warn,
}: MountLayerOptions<TLayer>) {
  if (layerRegistry.has(id)) {
    warn(`Layer with id "${id}" already exists. Skipping creation.`);
    return undefined;
  }

  const layer = createLayer();

  map.addLayer(layer);
  layerRegistry.set(id, layer);
  layerRef.current = layer;
  setReady(true);

  return () => {
    map.removeLayer(layer);
    layerRegistry.delete(id);
    layerRef.current = null;
    setReady(false);
  };
}
