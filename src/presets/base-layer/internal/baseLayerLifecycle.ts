type BaseLayerLike = {
  get: (key: string) => unknown;
};

type LayerCollection<TLayer> = {
  getArray: () => TLayer[];
  insertAt: (index: number, layer: TLayer) => void;
};

type BaseLayerMap<TLayer> = {
  getLayers: () => LayerCollection<TLayer>;
  removeLayer: (layer: TLayer) => void;
};

export function mountBaseLayer<TLayer extends BaseLayerLike>(
  map: BaseLayerMap<TLayer>,
  nextBaseLayer: TLayer,
) {
  const layers = map.getLayers();
  const layerArray = layers.getArray();
  const isAlreadyMounted = layerArray.includes(nextBaseLayer);

  if (!isAlreadyMounted) {
    layers.insertAt(0, nextBaseLayer);
  }

  const layersToRemove = layers
    .getArray()
    .filter((layer) => layer.get("role") === "base" && layer !== nextBaseLayer);

  layersToRemove.forEach((layer) => {
    map.removeLayer(layer);
  });
}
