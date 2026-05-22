/**
 * @ai-purpose React provider that owns the OpenLayers Map instance and shared layer/source registries.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends core context, OpenLayers Map/View, BaseLayerContext.
 * @ai-used-by Root package export, BaseLayer, Controls, OLSXVectorLayer children.
 * @ai-keywords OLSXMap, MapContext, BaseLayerContext, layerRegistryRef, sourceRegistryRef.
 * @ai-notes Preserve provider values and child render timing; many components depend on isMapReady.
 */

import { View } from "ol";
import type { Layer } from "ol/layer";
import OlMap from "ol/Map";
import { fromLonLat } from "ol/proj";
import type VectorSource from "ol/source/Vector";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BaseLayerContext, MapContext } from "../core/context";
import type { BaseLayerType } from "../core/types";

type OLSXMapRef = {
  getMap: () => OlMap | null;
  getLayerRegistry: () => Map<string, Layer>;
  getSourceRegistry: () => Map<string, VectorSource>;
  isMapReady: boolean;
};

type MapProps = {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];
const DEFAULT_ZOOM = 16;

export const OLSXMap = forwardRef<OLSXMapRef, MapProps>(
  (
    {
      style,
      defaultCenter = DEFAULT_CENTER,
      defaultZoom = DEFAULT_ZOOM,
      children,
    },
    ref,
  ) => {
    const [isMapReady, setIsMapReady] = useState(false);

    const mapRef = useRef<OlMap | null>(null);
    const mapElementRef = useRef<HTMLDivElement>(null);

    const layerRegistryRef = useRef<Map<string, Layer>>(new Map());
    const sourceRegistryRef = useRef<Map<string, VectorSource>>(new Map());

    const [baseLayerType, setBaseLayerType] = useState<BaseLayerType | null>(
      null,
    );

    useEffect(() => {
      const target = mapElementRef.current;
      if (!target) return;

      const view = new View({
        center: fromLonLat(defaultCenter),
        zoom: defaultZoom,
      });

      const map = new OlMap({
        target,
        view,
      });

      mapRef.current = map;

      setIsMapReady(true);

      return () => {
        mapRef.current = null;
        map.dispose();
        setIsMapReady(false);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getMap: () => mapRef.current,
        getLayerRegistry: () => layerRegistryRef.current,
        getSourceRegistry: () => sourceRegistryRef.current,
        isMapReady,
      }),
      [],
    );

    return (
      <MapContext.Provider
        value={{
          mapRef,
          isMapReady,
          layerRegistryRef,
          sourceRegistryRef,
        }}
      >
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
      </MapContext.Provider>
    );
  },
);
