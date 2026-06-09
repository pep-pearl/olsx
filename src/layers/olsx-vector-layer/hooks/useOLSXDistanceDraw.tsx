import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { getEventCoordinate } from "../../../core/utils/olUtils";
import {
  registerDrawingCommands,
  updateDrawingCommandState,
} from "../draw/internal/drawingCommandBus";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import {
  createLineStringFromCoordinates,
  getCompletedDistanceCoordinates,
  getDistancePreviewCoordinates,
  isManualDrawingCompletable,
  removeFeaturesFromSource,
  setDrawingIdOnFeatures,
  syncDrawingResultsToSource,
  type FeatureDrawingResult,
} from "../draw/internal/manualDrawing";
import {
  createDistanceDrawingResult,
  getLineSegmentMeasurements,
  getLineStringLength,
} from "../draw/internal/measurement";
import { useDrawingHistory } from "../headless";
import {
  getDrawingPresetCursor,
  DRAWING_PRESET_COLORS,
} from "../components/drawingPresetStyles";
import {
  useOLSXDrawLatestSourceRef,
  useOLSXDrawPoints,
  useOLSXDrawPreviewCoordinate,
} from "./useOLSXDraw";

export type UseOLSXDistanceDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

const DISTANCE_FEATURE_STYLE = new Style({
  stroke: new Stroke({ color: DRAWING_PRESET_COLORS.distance.main, width: 4 }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "#ffffff" }),
    stroke: new Stroke({
      color: DRAWING_PRESET_COLORS.distance.main,
      width: 3,
    }),
  }),
});

const DISTANCE_SKETCH_STYLE = new Style({
  stroke: new Stroke({
    color: DRAWING_PRESET_COLORS.distance.sketch,
    width: 4,
    lineDash: [8, 8],
  }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "rgba(255, 255, 255, 0.7)" }),
    stroke: new Stroke({
      color: DRAWING_PRESET_COLORS.distance.sketch,
      width: 3,
    }),
  }),
});

const DISTANCE_DOT_STYLE = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "#ffffff" }),
    stroke: new Stroke({
      color: DRAWING_PRESET_COLORS.distance.main,
      width: 3,
    }),
  }),
});

/**
 * Headless hook for OLSX manual distance drawing.
 */
export function useOLSXDistanceDraw({
  id = "distance",
  active = true,
  style,
  onComplete,
  onDelete,
}: UseOLSXDistanceDrawProps) {
  const { mapRef } = useMapRefsContext();
  const { latestSourceRef, vectorSourceRef } = useOLSXDrawLatestSourceRef();
  const { pointsRef, points, setNextPoints } = useOLSXDrawPoints();
  const { previewCoordinate, previewCoordinateRef, setNextPreviewCoordinate } =
    useOLSXDrawPreviewCoordinate();
  const history = useDrawingHistory<Feature>();
  const resultSeqRef = useRef(0);
  const knownResultsRef = useRef(new Map<string, FeatureDrawingResult>());
  const sketchFeatureRef = useRef<Feature<LineString> | null>(null);

  const previewCoordinates = useMemo(
    () => getDistancePreviewCoordinates(points, previewCoordinate),
    [points, previewCoordinate],
  );
  const previewLine =
    previewCoordinates.length > 1
      ? createLineStringFromCoordinates(previewCoordinates)
      : null;
  const drawingTotal = previewLine ? getLineStringLength(previewLine) : 0;
  const drawingSegments = getLineSegmentMeasurements(previewCoordinates);
  const isDrawing = points.length > 0;

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

    const coordinates = getDistancePreviewCoordinates(
      pointsRef.current,
      previewCoordinateRef.current,
    );

    if (coordinates.length < 2) {
      removeFeaturesFromSource(source, [sketchFeatureRef.current]);
      sketchFeatureRef.current = null;
      return;
    }

    const geometry = createLineStringFromCoordinates(coordinates);
    if (!sketchFeatureRef.current) {
      sketchFeatureRef.current = new Feature(geometry);
      sketchFeatureRef.current.setStyle(DISTANCE_SKETCH_STYLE);
      source.addFeature(sketchFeatureRef.current);
      return;
    }

    sketchFeatureRef.current.setGeometry(geometry);
  }, [vectorSourceRef]);

  const completeDrawing = useCallback(() => {
    const source = vectorSourceRef.current;
    const clickedPoints = pointsRef.current;
    if (
      !source ||
      !isManualDrawingCompletable("distance", clickedPoints.length)
    ) {
      clearSketch();
      return;
    }

    const coordinates = getCompletedDistanceCoordinates(clickedPoints);
    const feature = new Feature(createLineStringFromCoordinates(coordinates));
    feature.setStyle(
      (style as StyleLike | undefined) ?? DISTANCE_FEATURE_STYLE,
    );

    const result = createDistanceDrawingResult({
      id: `${id}:result:${resultSeqRef.current++}`,
      feature,
    }) as FeatureDrawingResult;
    result.attachments = coordinates.map((coordinate) => {
      const dot = new Feature(new Point(coordinate));
      dot.setStyle(DISTANCE_DOT_STYLE);
      return dot;
    });

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
      kind: "distance",
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
    viewport.style.cursor = getDrawingPresetCursor("distance");

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
        removeFeaturesFromSource(source, [
          result.feature,
          ...(result.attachments ?? []),
        ]);
      });
    };
  }, [latestSourceRef]);

  return {
    points,
    previewCoordinate,
    drawingTotal,
    drawingSegments,
    isDrawing,
    results: history.results,
    handleDelete,
  };
}
