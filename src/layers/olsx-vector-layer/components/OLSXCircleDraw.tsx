/**
 * @ai-purpose Declarative component for manual circle radius drawing, measurement, and tooltips.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends mapRefsContext, vectorLayerContext, manualDrawing, measurement, OLSXOverlay, useDrawingHistory
 * @ai-used-by OLSXVectorLayer compound component
 * @ai-keywords OLSXCircleDraw, circle, draw, radius, measurement, sketch
 */

import Feature from "ol/Feature";
import type { Coordinate } from "ol/coordinate";
import Circle from "ol/geom/Circle";
import Point from "ol/geom/Point";
import type OlVectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { OLSXOverlay } from "../../../olsx-overlay";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import {
  createCircleDrawingResult,
  formatDrawingMeters,
  getCircleRadius,
} from "../draw/internal/measurement";
import {
  getCirclePreviewGeometry,
  removeFeaturesFromSource,
  setDrawingIdOnFeatures,
  syncDrawingResultsToSource,
  type FeatureDrawingResult,
} from "../draw/internal/manualDrawing";
import { useDrawingHistory } from "../headless";
import { useVectorLayerContext } from "../internal/vectorLayerContext";
import {
  DONE_TOOLTIP_STYLE,
  FLOATING_TOOLTIP_STYLE,
  PRIMARY_VALUE_STYLE,
  deleteButtonStyle,
} from "./drawingPresetStyles";

export type OLSXCircleDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

const CIRCLE_FEATURE_STYLE = new Style({
  fill: new Fill({ color: "rgba(236, 0, 97, 0.14)" }),
  stroke: new Stroke({ color: "#ec0061", width: 3 }),
});

const CIRCLE_SKETCH_STYLE = new Style({
  fill: new Fill({ color: "rgba(236, 0, 97, 0.06)" }),
  stroke: new Stroke({
    color: "rgba(236, 0, 97, 0.48)",
    width: 3,
    lineDash: [8, 8],
  }),
});

const CIRCLE_CENTER_DOT_STYLE = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "#ffffff" }),
    stroke: new Stroke({ color: "#ec0061", width: 3 }),
  }),
});

function getEventCoordinate(
  map: { getEventCoordinate: (event: MouseEvent) => Coordinate },
  event: MouseEvent,
) {
  return map.getEventCoordinate(event).slice(0, 2);
}

function CircleDrawingSession({
  id,
  active,
  style,
  onComplete,
  onDelete,
}: Required<Pick<OLSXCircleDrawProps, "id" | "active">> &
  Pick<OLSXCircleDrawProps, "style" | "onComplete" | "onDelete">) {
  const { mapRef } = useMapRefsContext();
  const { vectorSourceRef } = useVectorLayerContext();
  const history = useDrawingHistory<Feature>();
  const resultSeqRef = useRef(0);
  const knownResultsRef = useRef(new Map<string, FeatureDrawingResult>());
  const latestSourceRef = useRef<OlVectorSource | null>(null);
  const centerRef = useRef<Coordinate | null>(null);
  const edgeRef = useRef<Coordinate | null>(null);
  const sketchFeatureRef = useRef<Feature<Circle> | null>(null);
  const centerDotRef = useRef<Feature<Point> | null>(null);
  const [center, setCenter] = useState<Coordinate | null>(null);
  const [edge, setEdge] = useState<Coordinate | null>(null);

  const previewCircle = useMemo(
    () => getCirclePreviewGeometry(center, edge),
    [center, edge],
  );
  const radius = previewCircle ? getCircleRadius(previewCircle) : 0;
  useEffect(() => {
    latestSourceRef.current = vectorSourceRef.current;
  });

  const setNextCenter = useCallback((coordinate: Coordinate | null) => {
    centerRef.current = coordinate;
    setCenter(coordinate);
  }, []);

  const setNextEdge = useCallback((coordinate: Coordinate | null) => {
    edgeRef.current = coordinate;
    setEdge(coordinate);
  }, []);

  const clearSketch = useCallback(
    (clearCenter = true) => {
      const source = vectorSourceRef.current;
      removeFeaturesFromSource(source, [sketchFeatureRef.current]);
      sketchFeatureRef.current = null;
      if (clearCenter) {
        removeFeaturesFromSource(source, [centerDotRef.current]);
        centerDotRef.current = null;
        setNextCenter(null);
      }
      setNextEdge(null);
    },
    [setNextCenter, setNextEdge, vectorSourceRef],
  );

  const syncCenterDot = useCallback(() => {
    const source = vectorSourceRef.current;
    const currentCenter = centerRef.current;
    if (!source || !currentCenter) return;

    if (!centerDotRef.current) {
      centerDotRef.current = new Feature(new Point(currentCenter));
      centerDotRef.current.setStyle(CIRCLE_CENTER_DOT_STYLE);
      source.addFeature(centerDotRef.current);
      return;
    }

    centerDotRef.current.setGeometry(new Point(currentCenter));
  }, [vectorSourceRef]);

  const syncSketchFeature = useCallback(() => {
    const source = vectorSourceRef.current;
    if (!source) return;

    syncCenterDot();
    const geometry = getCirclePreviewGeometry(centerRef.current, edgeRef.current);
    if (!geometry) {
      removeFeaturesFromSource(source, [sketchFeatureRef.current]);
      sketchFeatureRef.current = null;
      return;
    }

    if (!sketchFeatureRef.current) {
      sketchFeatureRef.current = new Feature(geometry);
      sketchFeatureRef.current.setStyle(CIRCLE_SKETCH_STYLE);
      source.addFeature(sketchFeatureRef.current);
      return;
    }

    sketchFeatureRef.current.setGeometry(geometry);
  }, [syncCenterDot, vectorSourceRef]);

  const completeCurrentRadius = useCallback(
    (keepCenter: boolean) => {
      const source = vectorSourceRef.current;
      const geometry = getCirclePreviewGeometry(centerRef.current, edgeRef.current);
      if (!source || !geometry) {
        clearSketch(!keepCenter);
        return;
      }

      const feature = new Feature(geometry.clone());
      feature.setStyle((style as StyleLike | undefined) ?? CIRCLE_FEATURE_STYLE);
      const result = createCircleDrawingResult({
        id: `${id}:result:${resultSeqRef.current++}`,
        feature,
      }) as FeatureDrawingResult;
      const centerDot = new Feature(new Point(geometry.getCenter()));
      centerDot.setStyle(CIRCLE_CENTER_DOT_STYLE);
      result.attachments = [centerDot];

      setDrawingIdOnFeatures(result);
      knownResultsRef.current.set(result.id, result);
      clearSketch(!keepCenter);
      if (keepCenter) syncCenterDot();
      history.complete(result);
      onComplete?.(result);
    },
    [clearSketch, history, id, onComplete, style, syncCenterDot, vectorSourceRef],
  );

  const handleDelete = useCallback(
    (result: DrawingResult<Feature>) => {
      history.deleteResult(result.id);
      onDelete?.(result);
    },
    [history, onDelete],
  );

  useEffect(() => {
    const source = vectorSourceRef.current;
    if (!source) return;
    syncDrawingResultsToSource(
      source,
      knownResultsRef.current.values(),
      new Set(history.results.map((result) => result.id)),
    );
  }, [history.results, vectorSourceRef]);

  useEffect(() => {
    if (!active) return;

    return () => {
      clearSketch();
    };
  }, [active, clearSketch]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;
    const viewport = map.getViewport();

    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const coordinate = getEventCoordinate(map, event);
      if (!centerRef.current) {
        setNextCenter(coordinate);
        setNextEdge(coordinate);
        queueMicrotask(syncSketchFeature);
        return;
      }

      setNextEdge(coordinate);
      queueMicrotask(() => completeCurrentRadius(true));
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!centerRef.current) return;
      setNextEdge(getEventCoordinate(map, event));
      queueMicrotask(syncSketchFeature);
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      completeCurrentRadius(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearSketch();
        return;
      }

      const isUndo = event.key.toLowerCase() === "z" && event.ctrlKey;
      if (!isUndo) return;

      event.preventDefault();
      if (centerRef.current && !event.shiftKey) {
        clearSketch();
        return;
      }

      if (event.shiftKey) {
        history.redo();
        return;
      }

      history.undo();
    };

    viewport.addEventListener("click", handleClick);
    viewport.addEventListener("pointermove", handlePointerMove);
    viewport.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      viewport.removeEventListener("click", handleClick);
      viewport.removeEventListener("pointermove", handlePointerMove);
      viewport.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    active,
    clearSketch,
    completeCurrentRadius,
    history,
    mapRef,
    setNextCenter,
    setNextEdge,
    syncSketchFeature,
  ]);

  useEffect(() => {
    const knownResults = knownResultsRef.current;

    return () => {
      const source = latestSourceRef.current;
      removeFeaturesFromSource(source, [sketchFeatureRef.current, centerDotRef.current]);
      knownResults.forEach((result) => {
        removeFeaturesFromSource(source, [result.feature, ...(result.attachments ?? [])]);
      });
    };
  }, []);

  return (
    <>
      <OLSXOverlay
        id={`${id}:drawing-tooltip`}
        coordinate={edge}
        visible={active && Boolean(center) && Boolean(edge)}
        positioning="bottom-center"
        offset={[0, -16]}
        stopEvent={false}
        insertFirst={false}
      >
        <div style={FLOATING_TOOLTIP_STYLE}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span>Radius</span>
            <strong style={PRIMARY_VALUE_STYLE}>
              {radius > 0 ? formatDrawingMeters(radius) : "-"}
            </strong>
          </div>
          <div style={{ color: "#d1d5db", marginTop: 6 }}>
            Click to add another radius
          </div>
          <div style={{ color: "#d1d5db" }}>Right click to finish center</div>
          <div style={{ color: "#d1d5db" }}>Esc cancels drawing</div>
        </div>
      </OLSXOverlay>
      {history.results.map((result) => (
        <OLSXOverlay
          key={result.id}
          id={result.id}
          coordinate={result.coordinate}
          positioning="bottom-center"
          offset={[0, -12]}
          stopEvent
          insertFirst={false}
        >
          <div style={DONE_TOOLTIP_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
              <span>Radius</span>
              <strong style={PRIMARY_VALUE_STYLE}>{result.label}</strong>
            </div>
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleDelete(result);
              }}
              style={deleteButtonStyle}
            >
              Delete
            </button>
          </div>
        </OLSXOverlay>
      ))}
    </>
  );
}

export function OLSXCircleDraw({
  id = "circle",
  active = true,
  style,
  onComplete,
  onDelete,
}: OLSXCircleDrawProps) {
  return (
    <CircleDrawingSession
      id={id}
      active={active}
      style={style}
      onComplete={onComplete}
      onDelete={onDelete}
    />
  );
}
