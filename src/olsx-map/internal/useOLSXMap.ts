import { Map as OlMap, View } from "ol";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";
import { useEffect, useRef, useState } from "react";
import type { OLSXMapProps } from "../types";

export function useOLSXMap(
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

    const map = new OlMap({
      target,
      controls: defaultControl,
    });

    mapRef.current = map;

    setIsMapReady(true);

    return () => {
      mapRef.current = null;
      viewRef.current = null;
      map.dispose();
      setIsMapReady(false);
    };
  }, [defaultControl]);

  return {
    mapRef,
    viewRef,
    layerRegistryRef,
    sourceRegistryRef,
    isMapReady,
    mapElementRef,
  };
}
