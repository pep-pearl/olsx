import type { MapBrowserEvent } from "ol";
import type { Coordinate } from "ol/coordinate";
import type { DrawEvent } from "ol/interaction/Draw";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  registerDrawListener,
  registerMapListener,
  type EventTargetWithOn,
  type MapEventTarget,
} from "../../../core/listeners/listenerRegistry";
import { useMapRefsContext } from "../../../core/model/context";
import { buildDrawListenerKey } from "../../../core/utils/olsxUtils";
import { useDrawContext } from "../internal/drawContext";

type DrawEventName = "drawstart" | "drawend" | "drawabort";

function isSameCoordinate(
  current: Coordinate | null,
  next: Coordinate | null,
) {
  return current?.[0] === next?.[0] && current?.[1] === next?.[1];
}

export function useDrawControl() {
  const { mapRef } = useMapRefsContext();
  const { id, active, draw, drawListenerRegistryRef, isDrawReady } =
    useDrawContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [feature, setFeature] = useState<DrawEvent["feature"] | null>(null);
  const isDrawingRef = useRef(false);

  const setDrawing = useCallback((nextIsDrawing: boolean) => {
    isDrawingRef.current = nextIsDrawing;
    setIsDrawing(nextIsDrawing);
  }, []);

  const setNextCoordinate = useCallback((nextCoordinate: Coordinate | null) => {
    setCoordinate((currentCoordinate) =>
      isSameCoordinate(currentCoordinate, nextCoordinate)
        ? currentCoordinate
        : nextCoordinate,
    );
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const registry = drawListenerRegistryRef.current;

    if (!draw || !map || !isDrawReady) return;

    if (!active) return;

    const registerDrawEvent = (
      eventName: DrawEventName,
      listener: (event: DrawEvent) => void,
    ) =>
      registerDrawListener(
        registry,
        draw as unknown as EventTargetWithOn,
        buildDrawListenerKey(id, eventName),
        eventName,
        listener as (event: never) => void,
      );

    const cleanupDrawStart = registerDrawEvent("drawstart", (event) => {
      setFeature(event.feature);
      setDrawing(true);
    });

    const stopDrawing = () => {
      setDrawing(false);
      setFeature(null);
      setNextCoordinate(null);
    };

    const cleanupDrawEnd = registerDrawEvent("drawend", stopDrawing);
    const cleanupDrawAbort = registerDrawEvent("drawabort", stopDrawing);

    const cleanupPointerMove = registerMapListener(
      registry,
      map as unknown as MapEventTarget,
      buildDrawListenerKey(id, "pointermove"),
      "pointermove",
      ((event: MapBrowserEvent) => {
        if (event.dragging) return;

        setCoordinate((currentCoordinate) => {
          const isCurrentlyDrawing = isDrawingRef.current;
          if (!currentCoordinate && !isCurrentlyDrawing) {
            return currentCoordinate;
          }

          const nextCoordinate = isCurrentlyDrawing ? event.coordinate : null;
          return isSameCoordinate(currentCoordinate, nextCoordinate)
            ? currentCoordinate
            : nextCoordinate;
        });
      }) as (event: never) => void,
    );

    return () => {
      cleanupDrawStart();
      cleanupDrawEnd();
      cleanupDrawAbort();
      cleanupPointerMove();
      stopDrawing();
    };
  }, [
    active,
    drawListenerRegistryRef,
    draw,
    id,
    isDrawReady,
    mapRef,
    setDrawing,
    setNextCoordinate,
  ]);

  return {
    id,
    active,
    draw,
    feature,
    coordinate,
    isDrawing,
    isDrawReady,
  };
}
