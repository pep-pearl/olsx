type VectorLayerLike<TSource> = {
  setSource: (source: TSource | null) => void;
};

export type MountVectorSourceOptions<TSource> = {
  id: string;
  layerRegistry: Map<string, VectorLayerLike<TSource>>;
  sourceRegistry: Map<string, TSource>;
  sourceRef: { current: TSource | null };
  createSource: () => TSource;
  clearFeaturesRegistry: () => void;
  warn?: (message: string) => void;
};

export function mountVectorSource<TSource>({
  id,
  layerRegistry,
  sourceRegistry,
  sourceRef,
  createSource,
  clearFeaturesRegistry,
  warn = console.warn,
}: MountVectorSourceOptions<TSource>) {
  const layer = layerRegistry.get(id);
  if (!layer) {
    warn(
      `Layer with id "${id}" does not exist in layer registry. Source will not be set.`,
    );
    return undefined;
  }

  if (sourceRegistry.has(id)) {
    warn(`Source with id "${id}" already exists. Skipping creation.`);
    return undefined;
  }

  const source = createSource();
  sourceRef.current = source;
  clearFeaturesRegistry();
  layer.setSource(source);
  sourceRegistry.set(id, source);

  return () => {
    layer.setSource(null);
    sourceRegistry.delete(id);
    clearFeaturesRegistry();
    sourceRef.current = null;
  };
}
