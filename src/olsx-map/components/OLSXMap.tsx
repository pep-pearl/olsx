/**
 * @ai-purpose React provider that owns the OpenLayers Map instance and shared layer/source registries.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends core model contexts, OpenLayers Map/View, BaseLayerContext.
 * @ai-used-by Root package export, BaseLayer, Controls, OLSXVectorLayer children.
 * @ai-keywords OLSXMap, MapRefsContext, MapReadyContext, BaseLayerContext, layerRegistryRef, sourceRegistryRef.
 * @ai-notes Preserve provider values and child render timing; many components depend on isMapReady.
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import type { Control } from "ol/control";
import {
  BaseLayerContext,
  MapReadyContext,
  MapRefsContext,
} from "../../core/model/context";
import type { BaseLayerType } from "../../core/types";
import { useOLSXMap } from "../internal/useOLSXMap";
import type { OLSXMapProps, OLSXMapRef } from "../types";

const EMPTY_CONTROLS: Control[] = [];

function OLSXMapComp(
  { style, children, defaultControl = EMPTY_CONTROLS }: OLSXMapProps,
  ref: React.ForwardedRef<OLSXMapRef>,
) {
  const {
    mapRef,
    viewRef,
    layerRegistryRef,
    sourceRegistryRef,
    listenerRegistryRef,
    isMapReady,
    mapElementRef,
  } = useOLSXMap(defaultControl);

  const [baseLayerType, setBaseLayerType] = useState<BaseLayerType | null>(
    null,
  );

  useImperativeHandle(
    ref,
    () => ({
      getMap: () => mapRef.current,
      getView: () => viewRef.current,
      getLayerRegistry: () => layerRegistryRef.current,
      getSourceRegistry: () => sourceRegistryRef.current,
      getListenerRegistry: () => listenerRegistryRef.current,
      isMapReady,
    }),
    [
      mapRef,
      viewRef,
      layerRegistryRef,
      sourceRegistryRef,
      listenerRegistryRef,
      isMapReady,
    ],
  );

  const mapRefsContextValue = useMemo(
    () => ({
      mapRef,
      viewRef,
      layerRegistryRef,
      sourceRegistryRef,
      listenerRegistryRef,
    }),
    [mapRef, viewRef, layerRegistryRef, sourceRegistryRef, listenerRegistryRef],
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
