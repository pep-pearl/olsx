/**
 * @ai-purpose Declarative component for OpenLayers Draw interaction linked to a vector source.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends Draw, mapRefsContext, vectorLayerContext
 * @ai-used-by OLSXVectorLayer.Draw compound component
 * @ai-keywords OLSXDraw, Draw, interaction, vectorSource
 */

/* eslint-disable react-refresh/only-export-components */

import Draw from "ol/interaction/Draw";
import { Fill, Stroke } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearListeners,
  createListenerRegistry,
  registerDrawListener,
  type EventTargetWithOn,
} from "../../../core/listeners/listenerRegistry";
import { useMapRefsContext } from "../../../core/model/context";
import { buildDrawListenerKey } from "../../../core/utils/olsxUtils";
import { DrawContext } from "../internal/drawContext";
import { useVectorLayerContext } from "../internal/vectorLayerContext";
import type { OLSXDrawProps, OLSXDrawRef } from "../types";
import { OLSXDrawTooltip } from "./OLSXDrawTooltip";

const DEFAULT_STYLE = new Style({
  fill: new Fill({ color: "rgba(59, 130, 246, 0.18)" }),
  stroke: new Stroke({
    color: "rgba(37, 99, 235, 0.85)",
    width: 3,
    lineDash: [6, 6],
  }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "rgba(37, 99, 235, 0.85)" }),
  }),
});

function OLSXDrawComp(
  {
    id,
    active = true,
    type = "LineString",
    style,
    onDrawStart,
    onDrawEnd,
    onDrawAbort,
    children,
    clickTolerance,
  }: OLSXDrawProps,
  ref: React.ForwardedRef<OLSXDrawRef>,
) {
  const generatedId = useId();
  const drawId = id ?? generatedId;
  const [isDrawReady, setIsDrawReady] = useState(false);
  const [drawInstance, setDrawInstance] = useState<Draw | null>(null);
  const { mapRef } = useMapRefsContext();
  const { vectorSourceRef } = useVectorLayerContext();
  const drawRef = useRef<Draw | null>(null);
  const drawListenerRegistryRef = useRef(createListenerRegistry());
  const initialActiveRef = useRef(active);

  useEffect(() => {
    const map = mapRef.current;
    const vectorSource = vectorSourceRef.current;
    const drawListenerRegistry = drawListenerRegistryRef.current;

    if (!map) return;

    if (!vectorSource) {
      console.warn("OLSXDraw requires vector source.");
      return;
    }

    const draw = new Draw({
      source: vectorSource,
      type,
      style: style ?? DEFAULT_STYLE,
      clickTolerance,
    });
    draw.setActive(initialActiveRef.current);
    map.addInteraction(draw);
    drawRef.current = draw;
    setDrawInstance(draw);
    setIsDrawReady(true);

    return () => {
      clearListeners(drawListenerRegistry);
      map.removeInteraction(draw);
      drawRef.current = null;
      setDrawInstance(null);
      setIsDrawReady(false);
    };
  }, [mapRef, vectorSourceRef, type, style, clickTolerance]);

  useEffect(() => {
    drawInstance?.setActive(active);
  }, [active, drawInstance]);

  useEffect(() => {
    const draw = drawRef.current;
    const registry = drawListenerRegistryRef.current;

    if (!draw || (!onDrawStart && !onDrawEnd && !onDrawAbort)) return;

    const cleanupFns = [
      onDrawStart
        ? registerDrawListener(
            registry,
            draw as unknown as EventTargetWithOn,
            buildDrawListenerKey(drawId, "props:drawstart"),
            "drawstart",
            onDrawStart as (event: never) => void,
          )
        : undefined,
      onDrawEnd
        ? registerDrawListener(
            registry,
            draw as unknown as EventTargetWithOn,
            buildDrawListenerKey(drawId, "props:drawend"),
            "drawend",
            onDrawEnd as (event: never) => void,
          )
        : undefined,
      onDrawAbort
        ? registerDrawListener(
            registry,
            draw as unknown as EventTargetWithOn,
            buildDrawListenerKey(drawId, "props:drawabort"),
            "drawabort",
            onDrawAbort as (event: never) => void,
          )
        : undefined,
    ];

    return () => {
      cleanupFns.forEach((cleanup) => cleanup?.());
    };
  }, [drawId, isDrawReady, onDrawAbort, onDrawEnd, onDrawStart]);

  useImperativeHandle(
    ref,
    () => ({
      getDraw: () => drawRef.current,
      getId: () => drawId,
      isActive: () => active,
    }),
    [active, drawId],
  );

  const childProps = useMemo(
    () => ({
      draw: drawInstance,
      id: drawId,
      active,
      isDrawReady,
    }),
    [active, drawId, drawInstance, isDrawReady],
  );

  if (!isDrawReady) return null;

  return (
    <DrawContext.Provider
      value={{
        id: drawId,
        active,
        draw: drawInstance,
        drawRef,
        isDrawReady,
        drawListenerRegistryRef,
      }}
    >
      {typeof children === "function" ? children(childProps) : children}
    </DrawContext.Provider>
  );
}

export const OLSXDraw = Object.assign(forwardRef(OLSXDrawComp), {
  Tooltip: OLSXDrawTooltip,
});
