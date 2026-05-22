/**
 * @ai-purpose React provider that owns the OpenLayers Map instance and shared layer/source registries.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends core model contexts, OpenLayers Map/View, BaseLayerContext.
 * @ai-used-by Root package export, BaseLayer, Controls, OLSXVectorLayer children.
 * @ai-keywords OLSXMap, MapRefsContext, MapReadyContext, BaseLayerContext, layerRegistryRef, sourceRegistryRef.
 * @ai-notes Preserve provider values and child render timing; many components depend on isMapReady.
 */

import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import {
  BaseLayerContext,
  MapReadyContext,
  MapRefsContext,
} from "../../core/model/context";
import type { OLSXMapProps, OLSXMapRef } from "./types";
import { useOLSXMap } from "./useOLSXMap";

const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];
const DEFAULT_ZOOM = 16;

function OLSXMapComp(
  {
    style,
    defaultCenter = DEFAULT_CENTER,
    defaultZoom = DEFAULT_ZOOM,
    children,
  }: OLSXMapProps,
  ref: React.ForwardedRef<OLSXMapRef>,
) {
  const {
    mapRef,
    layerRegistryRef,
    sourceRegistryRef,
    isMapReady,
    mapElementRef,
    baseLayerType,
    setBaseLayerType,
  } = useOLSXMap(defaultCenter, defaultZoom);

  useImperativeHandle(
    ref,
    () => ({
      getMap: () => mapRef.current,
      getLayerRegistry: () => layerRegistryRef.current,
      getSourceRegistry: () => sourceRegistryRef.current,
      isMapReady,
    }),
    [mapRef, layerRegistryRef, sourceRegistryRef, isMapReady],
  );

  const mapRefsContextValue = useMemo(
    () => ({
      mapRef,
      layerRegistryRef,
      sourceRegistryRef,
    }),
    [mapRef, layerRegistryRef, sourceRegistryRef],
  );

  const mapReadyContextValue = useMemo(
    () => ({
      isMapReady,
    }),
    [isMapReady],
  );

  return (
    <MapRefsContext.Provider value={mapRefsContextValue}>
      <MapReadyContext.Provider value={mapReadyContextValue}>
        <BaseLayerContext.Provider
          value={{
            baseLayerType,
            setBaseLayerType,
          }}
        >
          <div style={{ position: "relative", ...style }}>
            <div
              ref={mapElementRef}
              style={{ width: "100%", height: "100%" }}
            />
            {isMapReady && children}
          </div>
        </BaseLayerContext.Provider>
      </MapReadyContext.Provider>
    </MapRefsContext.Provider>
  );
}

export const OLSXMap = forwardRef(OLSXMapComp);
