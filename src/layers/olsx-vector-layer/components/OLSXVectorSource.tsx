import OlVectorSource from "ol/source/Vector";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { useVectorLayerContext } from "../internal/vectorLayerContext";
import type { OLSXVectorSourceRef } from "../types";

function OLSXVectorSourceComp(
  _props: Record<string, never>,
  ref: React.ForwardedRef<OLSXVectorSourceRef>,
) {
  const { mapRef, layerRegistryRef, sourceRegistryRef } = useMapRefsContext();
  const { id, vectorSourceRef, featuresRegistryRef } = useVectorLayerContext();
  const [isSourceReady, setIsSourceReady] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      getVectorSource: () => vectorSourceRef.current,
      getRegistry: () => featuresRegistryRef.current,
      isSourceReady,
    }),
    [featuresRegistryRef, isSourceReady, vectorSourceRef],
  );

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
    const featuresRegistry = featuresRegistryRef.current;
    const vectorSource = new OlVectorSource();
    vectorSourceRef.current = vectorSource;
    featuresRegistry.clear();
    layerRegistry.get(id)?.setSource(vectorSource);
    sourceRegistry.set(id, vectorSource);
    setIsSourceReady(true);

    return () => {
      layerRegistry?.get(id)?.setSource(null);
      sourceRegistry?.delete(id);
      featuresRegistry.clear();
      vectorSourceRef.current = null;
      setIsSourceReady(false);
    };
  }, [
    featuresRegistryRef,
    id,
    layerRegistryRef,
    mapRef,
    sourceRegistryRef,
    vectorSourceRef,
  ]);

  return null;
}

export const OLSXVectorSource = forwardRef(OLSXVectorSourceComp);
