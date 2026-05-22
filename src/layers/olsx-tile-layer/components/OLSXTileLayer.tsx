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
