import OlVectorSource from "ol/source/Vector";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { mountVectorSource } from "../internal/vectorSourceLifecycle";
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

    const cleanup = mountVectorSource({
      id,
      layerRegistry: layerRegistryRef.current,
      sourceRegistry: sourceRegistryRef.current,
      sourceRef: vectorSourceRef,
      createSource: () => new OlVectorSource(),
      clearFeaturesRegistry: () => featuresRegistryRef.current.clear(),
    });

    if (!cleanup) return;

    setIsSourceReady(true);

    return () => {
      cleanup();
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
