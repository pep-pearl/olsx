import { Map as OlMap, View } from "ol";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearMapListeners,
  createListenerRegistry,
} from "../../core/listeners/listenerRegistry";
import type { OLSXMapProps } from "../types";
import { mountMap } from "./mapLifecycle";

export function useOLSXMap(
  defaultControl: NonNullable<OLSXMapProps["defaultControl"]>,
) {
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<OlMap | null>(null);
  const viewRef = useRef<View | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);

  const layerRegistryRef = useRef<Map<string, Layer>>(new Map());
  const sourceRegistryRef = useRef<Map<string, VectorSource>>(new Map());
  const listenerRegistryRef = useRef(createListenerRegistry());

  const lastControlsRef = useRef(defaultControl);

  const stableControl = useMemo(() => {
    const prev = lastControlsRef.current;
    if (prev === defaultControl) return prev;

    if (Array.isArray(prev) && Array.isArray(defaultControl)) {
      if (
        prev.length === defaultControl.length &&
        prev.every((v, i) => v === defaultControl[i])
      ) {
        return prev;
      }
    }

    lastControlsRef.current = defaultControl;
    return defaultControl;
  }, [defaultControl]);

  useEffect(() => {
    const target = mapElementRef.current;
    const listenerRegistry = listenerRegistryRef.current;
    if (!target) return;

    const cleanupMap = mountMap({
      target,
      controls: stableControl,
      mapRef,
      viewRef,
      createMap: ({ target: mapTarget, controls }) =>
        new OlMap({
          target: mapTarget,
          controls: controls as NonNullable<OLSXMapProps["defaultControl"]>,
        }),
      setReady: setIsMapReady,
    });

    return () => {
      clearMapListeners(listenerRegistry);
      cleanupMap();
    };
  }, [stableControl]);

  return {
    mapRef,
    viewRef,
    layerRegistryRef,
    sourceRegistryRef,
    listenerRegistryRef,
    isMapReady,
    mapElementRef,
  };
}
