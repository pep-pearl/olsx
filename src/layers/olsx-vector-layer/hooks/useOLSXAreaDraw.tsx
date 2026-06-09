import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { Fill, Stroke, Style } from "ol/style";
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
  createPolygonFromCoordinates,
  getAreaPreviewCoordinates,
  getCompletedAreaCoordinates,
  isManualDrawingCompletable,
  removeFeaturesFromSource,
  setDrawingIdOnFeatures,
  syncDrawingResultsToSource,
  type FeatureDrawingResult,
} from "../draw/internal/manualDrawing";
import {
  createAreaDrawingResult,
  getPolygonArea,
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

export type UseOLSXAreaDrawProps = {
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

/**
 * Headless hook for OLSX manual area (polygon) drawing.
 */
export function useOLSXAreaDraw({
  id = "area",
  active = true,
  style,
  onComplete,
  onDelete,
}: UseOLSXAreaDrawProps) {
  const { mapRef } = useMapRefsContext();
  const { latestSourceRef, vectorSourceRef } = useOLSXDrawLatestSourceRef();
  const { pointsRef, points, setNextPoints } = useOLSXDrawPoints();
  const { previewCoordinate, previewCoordinateRef, setNextPreviewCoordinate } =
    useOLSXDrawPreviewCoordinate();
  const history = useDrawingHistory<Feature>();
  const resultSeqRef = useRef(0);
  const knownResultsRef = useRef(new Map<string, FeatureDrawingResult>());
  const sketchFeatureRef = useRef<Feature<Polygon> | null>(null);

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
    area,
    canShowArea,
    results: history.results,
    handleDelete,
  };
}
