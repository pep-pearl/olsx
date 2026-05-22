/**
 * @ai-purpose React wrapper for an OpenLayers vector layer and its typed feature-set children.
 * @ai-entry true
 * @ai-domain gis
 * @ai-depends OLSXMap registry context, VectorLayerContext, vector style cache utilities.
 * @ai-used-by OLSXVectorLayer compound API and createVectorLayer typed factory.
 * @ai-keywords OLSXVectorLayer, VectorLayerProps, VectorLayerRef, style, cacheStyle, types.
 * @ai-notes Keep OpenLayers layer lifecycle separate from FeatureSet data/source lifecycle.
 */

import { forwardRef, useImperativeHandle } from "react";
import { useOLSXVectorLayer } from "../hooks/useOLSXVectorLayer";
import { VectorLayerContext } from "../model/vectorLayerContext";
import type { OLSXVectorLayerProps, OLSXVectorLayerRef } from "../types";

function OLSXVectorLayerComp<
  TTypes extends readonly string[] = readonly string[],
>(
  {
    id,
    types,
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

  useImperativeHandle(
    ref,
    () => ({
      getVectorLayer: () => vectorLayerRef.current,
      isVectorLayerReady,
    }),
    [isVectorLayerReady, vectorLayerRef],
  );

  return (
    <VectorLayerContext.Provider value={{ id, types: types ?? [] }}>
      {isVectorLayerReady && children}
    </VectorLayerContext.Provider>
  );
}

export const OLSXVectorLayer = forwardRef(
  OLSXVectorLayerComp,
) as typeof OLSXVectorLayerComp;
