import OlVectorSource from "ol/source/Vector";
import { useEffect } from "react";
import { useMapContext } from "../../core/context";
import { useVectorLayerContext } from "./vectorLayerContext";

export function VectorSource() {
  const { mapRef, layerRegistryRef, sourceRegistryRef } = useMapContext();
  const { id } = useVectorLayerContext();

  useEffect(() => {
    if (!mapRef?.current || !layerRegistryRef?.current || !sourceRegistryRef)
      return;
    const layerRegistry = layerRegistryRef?.current;
    if (!layerRegistry?.has(id)) {
      console.warn(
        `Layer with id "${id}" does not exist in layer registry. Source will not be set.`,
      );
      return;
    }
    const sourceRegistry = sourceRegistryRef?.current;
    if (sourceRegistry?.has(id)) {
      console.warn(`Source with id "${id}" already exists. Skipping creation.`);
      return;
    }
    const vectorSource = new OlVectorSource();
    layerRegistry.get(id)?.setSource(vectorSource);
    sourceRegistry.set(id, vectorSource);

    return () => {
      layerRegistry?.get(id)?.setSource(null);
      sourceRegistry?.delete(id);
    };
  }, [mapRef, layerRegistryRef, sourceRegistryRef, id]);

  return null;
}
