import { useEffect, useRef, useState } from "react";
import OlMap from "ol/Map";
import { View } from "ol";
import { MapContext } from "./context";
import { fromLonLat } from "ol/proj";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";

type MapProps = {
  initCenter?: [number, number];
  initZoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function OLXMap({
  style,
  initCenter = [126.978, 37.5665],
  initZoom = 16,
  children,
}: MapProps) {
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<OlMap>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(null);

  const layerRegistryRef = useRef<Map<string, Layer>>(new Map());
  const sourceRegistryRef = useRef<Map<string, VectorSource>>(new Map());

  const baseLayerTypeRef = useRef<"street" | "satellite" | null>(null);

  const centerRef = useRef(initCenter);
  const zoomRef = useRef(initZoom);

  useEffect(() => {
    if (!mapElementRef.current) return;

    const map = new OlMap({
      target: mapElementRef.current,
    });
    const view = new View({
      center: fromLonLat(centerRef.current),
      zoom: zoomRef.current,
    });
    mapRef.current = map;
    viewRef.current = view;
    map.setView(view);
    setIsMapReady(true);
    return () => {
      mapRef.current = null;
      mapElementRef.current = null;
      viewRef.current = null;
      map.dispose();
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getView().setCenter(fromLonLat(initCenter));
    centerRef.current = initCenter;
  }, [initCenter]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getView().setZoom(initZoom);
    zoomRef.current = initZoom;
  }, [initZoom]);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        baseLayerTypeRef,
        viewRef,
        layerRegistryRef,
        sourceRegistryRef,
      }}
    >
      <div style={{ position: "relative", ...style }}>
        <div ref={mapElementRef} style={{ width: "100%", height: "100%" }} />
        {isMapReady && children}
      </div>
    </MapContext.Provider>
  );
}
