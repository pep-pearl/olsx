/**
 * @ai-purpose Shared hook for mounting an OpenLayers layer into OLSXMap and registering it by id.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends MapRefsContext and OpenLayers Layer lifecycle.
 * @ai-used-by OLSXTileLayer and OLSXVectorLayer hooks.
 * @ai-keywords useMountLayer, layerRegistryRef, map.addLayer, map.removeLayer, layerRef, isLayerReady.
 * @ai-notes Prefer this hook for new layer wrappers so registry and cleanup behavior stay consistent.
 */

import { Layer } from "ol/layer";
import { useEffect, useRef, useState } from "react";
import { mountLayerById } from "../internal/layerLifecycle";
import { useMapRefsContext } from "../model/context";

export function useMountLayer<T extends Layer>(
  id: string,
  createLayer: () => T,
) {
  const layerRef = useRef<T | null>(null);
  const createLayerRef = useRef(createLayer);
  const [isLayerReady, setIsLayerReady] = useState(false);
  const { mapRef, layerRegistryRef } = useMapRefsContext();

  useEffect(() => {
    createLayerRef.current = createLayer;
  }, [createLayer]);

  useEffect(() => {
    const map = mapRef.current;
    const layerRegistry = layerRegistryRef.current;

    if (!map || !layerRegistry) return;

    return mountLayerById({
      id,
      map,
      layerRegistry,
      layerRef,
      createLayer: () => createLayerRef.current(),
      setReady: setIsLayerReady,
    });
  }, [id, mapRef, layerRegistryRef]);

  return { isLayerReady, layerRef };
}
