import { Map as OlMap, View } from "ol";
import type { Layer } from "ol/layer";
import { fromLonLat } from "ol/proj";
import type VectorSource from "ol/source/Vector";
import { useEffect, useRef, useState } from "react";
import type { OLSXMapProps } from "../types";

export function useOLSXMap(
  defaultCenter: NonNullable<OLSXMapProps["defaultCenter"]>,
  defaultZoom: NonNullable<OLSXMapProps["defaultZoom"]>,
  defaultControl: NonNullable<OLSXMapProps["defaultControl"]>,
) {
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<OlMap | null>(null);
  const viewRef = useRef<View | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);

  const layerRegistryRef = useRef<Map<string, Layer>>(new Map());
  const sourceRegistryRef = useRef<Map<string, VectorSource>>(new Map());

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
      controls: defaultControl,
    });

    mapRef.current = map;
    viewRef.current = view;

    setIsMapReady(true);

    return () => {
      mapRef.current = null;
      viewRef.current = null;
      map.dispose();
      setIsMapReady(false);
    };
  }, []);

  return {
    mapRef,
    viewRef,
    layerRegistryRef,
    sourceRegistryRef,
    isMapReady,
    mapElementRef,
  };
}
