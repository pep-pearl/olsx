/**
 * @ai-purpose Generic React wrapper for mounting an OpenLayers TileLayer with a provided source.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends useMountLayer and OLSXTileLayer types.
 * @ai-used-by Public package exports and consumers needing direct tile-layer control.
 * @ai-keywords OLSXTileLayer, OLSXTileLayerRef, OLSXTileLayerProps, TileLayer, XYZ.
 * @ai-notes This is lower-level than the BaseLayer preset and does not manage base-layer toggle state.
 */

import TileLayer from "ol/layer/Tile";
import type { XYZ } from "ol/source";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useMountLayer } from "../../../core/hooks/useMountLayer";
import type { OLSXTileLayerProps, OLSXTileLayerRef } from "../types";

function useOLSXTileLayer(id: string, source?: XYZ) {
  const { isLayerReady: isTileLayerReady, layerRef: tileLayerRef } =
    useMountLayer(id, () => new TileLayer({ source }));
  useEffect(() => {}, []);

  return {
    isTileLayerReady,
    tileLayerRef,
  };
}

function OLSXTileLayerComp(
  { id, source }: OLSXTileLayerProps,
  ref: React.ForwardedRef<OLSXTileLayerRef>,
) {
  const { isTileLayerReady, tileLayerRef } = useOLSXTileLayer(id, source);

  useImperativeHandle(
    ref,
    () => ({
      getTileLayer: () => tileLayerRef.current,
      isTileLayerReady,
    }),
    [isTileLayerReady, tileLayerRef],
  );
  return null;
}

const OLSXTileLayer = forwardRef(OLSXTileLayerComp);

export { OLSXTileLayer };
