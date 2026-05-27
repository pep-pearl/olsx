/**
 * @ai-purpose Declarative component for manual polygon area drawing, measurement, and tooltips.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends mapRefsContext, vectorLayerContext, drawingCommandBus, manualDrawing, measurement, OLSXOverlay, useDrawingHistory
 * @ai-used-by OLSXVectorLayer compound component
 * @ai-keywords OLSXAreaDraw, area, draw, polygon, measurement, sketch
 */

import Feature from "ol/Feature";
import type { Coordinate } from "ol/coordinate";
import Polygon from "ol/geom/Polygon";
import type OlVectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { OLSXOverlay } from "../../../olsx-overlay";
import {
  registerDrawingCommands,
  updateDrawingCommandState,
} from "../draw/internal/drawingCommandBus";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import {
  createAreaDrawingResult,
  formatDrawingArea,
  getPolygonArea,
} from "../draw/internal/measurement";
import {
  createPolygonFromCoordinates,
  getAreaPreviewCoordinates,
  getCompletedAreaCoordinates,
  isManualDrawingCompletable,
  removeFeaturesFromSource,
  setDrawingIdOnFeatures,
  syncDrawingResultsToSource,
  type FeatureDrawingResult,
} from "../draw/internal/manualDrawing";
import { useDrawingHistory } from "../headless";
import { useVectorLayerContext } from "../internal/vectorLayerContext";
import {
  DONE_TOOLTIP_STYLE,
  DRAWING_PRESET_COLORS,
  FLOATING_TOOLTIP_STYLE,
  deleteButtonStyle,
  getDrawingPresetCursor,
  getPrimaryValueStyle,
} from "./drawingPresetStyles";

export type OLSXAreaDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

const AREA_FEATURE_STYLE = new Style({
  fill: new Fill({ color: DRAWING_PRESET_COLORS.area.fill }),
  stroke: new Stroke({ color: DRAWING_PRESET_COLORS.area.main, width: 3 }),
});

const AREA_SKETCH_STYLE = new Style({
  fill: new Fill({ color: DRAWING_PRESET_COLORS.area.sketchFill }),
  stroke: new Stroke({
    color: DRAWING_PRESET_COLORS.area.sketch,
    width: 3,
    lineDash: [8, 8],
  }),
});

function getEventCoordinate(
  map: { getEventCoordinate: (event: MouseEvent) => Coordinate },
  event: MouseEvent,
) {
  return map.getEventCoordinate(event).slice(0, 2);
}

function AreaDrawingSession({
  id,
  active,
  style,
  onComplete,
  onDelete,
}: Required<Pick<OLSXAreaDrawProps, "id" | "active">> &
  Pick<OLSXAreaDrawProps, "style" | "onComplete" | "onDelete">) {
  const { mapRef } = useMapRefsContext();
  const { vectorSourceRef } = useVectorLayerContext();
  const history = useDrawingHistory<Feature>();
  const resultSeqRef = useRef(0);
  const knownResultsRef = useRef(new Map<string, FeatureDrawingResult>());
  const latestSourceRef = useRef<OlVectorSource | null>(null);
  const pointsRef = useRef<Coordinate[]>([]);
  const previewCoordinateRef = useRef<Coordinate | null>(null);
  const sketchFeatureRef = useRef<Feature<Polygon> | null>(null);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [previewCoordinate, setPreviewCoordinate] = useState<Coordinate | null>(
    null,
  );

  const previewCoordinates = useMemo(
    () => getAreaPreviewCoordinates(points, previewCoordinate),
    [points, previewCoordinate],
  );
  const previewPolygon =
    previewCoordinates.length >= 4
      ? createPolygonFromCoordinates(previewCoordinates)
      : null;
  const canShowArea = points.length >= 3 && Boolean(previewPolygon);
  const area = previewPolygon ? getPolygonArea(previewPolygon) : 0;
  useEffect(() => {
    latestSourceRef.current = vectorSourceRef.current;
  });

  const setNextPoints = useCallback((nextPoints: Coordinate[]) => {
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
  }, []);

  const setNextPreviewCoordinate = useCallback((coordinate: Coordinate | null) => {
    previewCoordinateRef.current = coordinate;
    setPreviewCoordinate(coordinate);
  }, []);

  const clearSketch = useCallback(() => {
    const source = vectorSourceRef.current;
    removeFeaturesFromSource(source, [sketchFeatureRef.current]);
    sketchFeatureRef.current = null;
    setNextPoints([]);
    setNextPreviewCoordinate(null);
  }, [setNextPoints, setNextPreviewCoordinate, vectorSourceRef]);

  const syncSketchFeature = useCallback(() => {
    const source = vectorSourceRef.current;
    if (!source) return;

    const coordinates = getAreaPreviewCoordinates(
      pointsRef.current,
      previewCoordinateRef.current,
    );

    if (coordinates.length < 4) {
      removeFeaturesFromSource(source, [sketchFeatureRef.current]);
      sketchFeatureRef.current = null;
      return;
    }

    const geometry = createPolygonFromCoordinates(coordinates);
    if (!sketchFeatureRef.current) {
      sketchFeatureRef.current = new Feature(geometry);
      sketchFeatureRef.current.setStyle(AREA_SKETCH_STYLE);
      source.addFeature(sketchFeatureRef.current);
      return;
    }

    sketchFeatureRef.current.setGeometry(geometry);
  }, [vectorSourceRef]);

  const completeDrawing = useCallback(() => {
    const source = vectorSourceRef.current;
    const clickedPoints = pointsRef.current;
    if (!source || !isManualDrawingCompletable("area", clickedPoints.length)) {
      clearSketch();
      return;
    }

    const coordinates = getCompletedAreaCoordinates(clickedPoints);
    if (coordinates.length < 4) {
      clearSketch();
      return;
    }

    const feature = new Feature(createPolygonFromCoordinates(coordinates));
    feature.setStyle((style as StyleLike | undefined) ?? AREA_FEATURE_STYLE);
    const result = createAreaDrawingResult({
      id: `${id}:result:${resultSeqRef.current++}`,
      feature,
    }) as FeatureDrawingResult;

    setDrawingIdOnFeatures(result);
    knownResultsRef.current.set(result.id, result);
    clearSketch();
    history.complete(result);
    onComplete?.(result);
  }, [clearSketch, history, id, onComplete, style, vectorSourceRef]);

  const handleDelete = useCallback(
    (result: DrawingResult<Feature>) => {
      history.deleteResult(result.id);
      onDelete?.(result);
    },
    [history, onDelete],
  );

  const clearHistory = history.clear;
  const clearAllDrawings = useCallback(() => {
    clearSketch();
    clearHistory();
  }, [clearHistory, clearSketch]);

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
    return registerDrawingCommands(id, {
      kind: "area",
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      cancel: clearSketch,
      undo: history.undo,
      redo: history.redo,
      clear: clearAllDrawings,
    });
  }, [
    clearAllDrawings,
    clearSketch,
    history.canRedo,
    history.canUndo,
    history.redo,
    history.undo,
    id,
  ]);

  useEffect(() => {
    updateDrawingCommandState(id, {
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  }, [history.canRedo, history.canUndo, history.results.length, id]);

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
    const previousCursor = viewport.style.cursor;
    viewport.style.cursor = getDrawingPresetCursor("area");

    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const coordinate = getEventCoordinate(map, event);
      setNextPoints([...pointsRef.current, coordinate]);
      setNextPreviewCoordinate(coordinate);
      queueMicrotask(syncSketchFeature);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (pointsRef.current.length === 0) return;
      setNextPreviewCoordinate(getEventCoordinate(map, event));
      queueMicrotask(syncSketchFeature);
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      completeDrawing();
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
      if (pointsRef.current.length > 0 && !event.shiftKey) {
        const nextPoints = pointsRef.current.slice(0, -1);
        setNextPoints(nextPoints);
        setNextPreviewCoordinate(nextPoints.at(-1) ?? null);
        queueMicrotask(syncSketchFeature);
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
      viewport.style.cursor = previousCursor;
    };
  }, [
    active,
    clearSketch,
    completeDrawing,
    history,
    mapRef,
    setNextPoints,
    setNextPreviewCoordinate,
    syncSketchFeature,
  ]);

  useEffect(() => {
    const knownResults = knownResultsRef.current;

    return () => {
      const source = latestSourceRef.current;
      removeFeaturesFromSource(source, [sketchFeatureRef.current]);
      knownResults.forEach((result) => {
        removeFeaturesFromSource(source, [result.feature, ...(result.attachments ?? [])]);
      });
    };
  }, []);

  return (
    <>
      <OLSXOverlay
        id={`${id}:drawing-tooltip`}
        coordinate={previewCoordinate}
        visible={active && points.length > 0 && Boolean(previewCoordinate)}
        positioning="bottom-center"
        offset={[0, -16]}
        stopEvent={false}
        insertFirst={false}
      >
        <div style={FLOATING_TOOLTIP_STYLE}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span>Area</span>
            <strong style={getPrimaryValueStyle("area")}>
              {canShowArea ? formatDrawingArea(area) : "-"}
            </strong>
          </div>
          <div style={{ color: "#d1d5db", marginTop: 6 }}>Right click to finish</div>
          <div style={{ color: "#d1d5db" }}>Esc cancels drawing</div>
          <div style={{ color: "#d1d5db" }}>Ctrl+Z removes the last point</div>
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
              <span>Area</span>
              <strong style={getPrimaryValueStyle("area")}>{result.label}</strong>
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

export function OLSXAreaDraw({
  id = "area",
  active = true,
  style,
  onComplete,
  onDelete,
}: OLSXAreaDrawProps) {
  return (
    <AreaDrawingSession
      id={id}
      active={active}
      style={style}
      onComplete={onComplete}
      onDelete={onDelete}
    />
  );
}
