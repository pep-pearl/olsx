/**
 * @ai-purpose React wrapper for an OpenLayers vector layer and its typed vector-source children.
 * @ai-entry true
 * @ai-domain gis
 * @ai-depends OLSXMap registry context, VectorLayerContext, vector style cache utilities.
 * @ai-used-by OLSXVectorLayer compound API and createVectorLayer typed factory.
 * @ai-keywords OLSXVectorLayer, VectorLayerProps, VectorLayerRef, style, cacheStyle, types.
 * @ai-notes Keep OpenLayers layer lifecycle separate from Feature/Features data/source lifecycle.
 */

import OlVectorSource from "ol/source/Vector";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useOLSXVectorLayer } from "../internal/useOLSXVectorLayer";
import { VectorLayerContext } from "../internal/vectorLayerContext";
import { createFeaturesRegistry } from "../registry/featuresRegistry";
import type { OLSXVectorLayerProps, OLSXVectorLayerRef } from "../types";

function OLSXVectorLayerComp<
  TTypes extends readonly string[] = readonly string[],
>(
  {
    id,
    featureTypes,
    children,
    style,
    cacheStyle = true,
  }: OLSXVectorLayerProps<TTypes>,
  ref: React.ForwardedRef<OLSXVectorLayerRef>,
) {
  const { vectorLayerRef, isVectorLayerReady } = useOLSXVectorLayer({
    id,
    style,
    cacheStyle,
  });
  const vectorSourceRef = useRef<OlVectorSource | null>(null);
  const featuresRegistryRef = useRef(createFeaturesRegistry());

  useImperativeHandle(
    ref,
    () => ({
      getVectorLayer: () => vectorLayerRef.current,
      isVectorLayerReady,
    }),
    [isVectorLayerReady, vectorLayerRef],
  );

  const vectorLayerContextValue = useMemo(
    () => ({
      id,
      featureTypes: featureTypes ?? [],
      vectorSourceRef,
      featuresRegistryRef,
    }),
    [id, featureTypes],
  );

  return (
    <VectorLayerContext.Provider value={vectorLayerContextValue}>
      {isVectorLayerReady && children}
    </VectorLayerContext.Provider>
  );
}

export const OLSXVectorLayer = forwardRef(
  OLSXVectorLayerComp,
) as typeof OLSXVectorLayerComp;
