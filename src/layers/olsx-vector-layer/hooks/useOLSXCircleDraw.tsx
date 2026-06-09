import type { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { getEventCoordinate } from "../../../core/utils/olUtils";
import {
  DRAWING_PRESET_COLORS,
  getDrawingPresetCursor,
} from "../components/drawingPresetStyles";
import {
  registerDrawingCommands,
  updateDrawingCommandState,
} from "../draw/internal/drawingCommandBus";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import {
  createClickOnlyPointerGuard,
  getCirclePreviewGeometry,
  getCircleRadiusLineCoordinates,
  removeFeaturesFromSource,
  setDrawingIdOnFeatures,
  syncDrawingResultsToSource,
  type FeatureDrawingResult,
} from "../draw/internal/manualDrawing";
import {
  createCircleDrawingResult,
  getCircleRadius,
} from "../draw/internal/measurement";
import { useDrawingHistory } from "../headless";
import { useOLSXDrawLatestSourceRef } from "./useOLSXDraw";

export type UseOLSXCircleDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

const CIRCLE_FEATURE_STYLE = new Style({
  fill: new Fill({ color: DRAWING_PRESET_COLORS.circle.fill }),
  stroke: new Stroke({ color: DRAWING_PRESET_COLORS.circle.main, width: 3 }),
});

const CIRCLE_SKETCH_STYLE = new Style({
  fill: new Fill({ color: DRAWING_PRESET_COLORS.circle.sketchFill }),
  stroke: new Stroke({
    color: DRAWING_PRESET_COLORS.circle.sketch,
    width: 3,
    lineDash: [8, 8],
  }),
});

const CIRCLE_CENTER_DOT_STYLE = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "#ffffff" }),
    stroke: new Stroke({ color: DRAWING_PRESET_COLORS.circle.main, width: 3 }),
  }),
});

const CIRCLE_RADIUS_POINT_STYLE = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "#ffffff" }),
    stroke: new Stroke({ color: DRAWING_PRESET_COLORS.circle.main, width: 3 }),
  }),
});

const CIRCLE_RADIUS_LINE_STYLE = new Style({
  stroke: new Stroke({
    color: DRAWING_PRESET_COLORS.circle.main,
    width: 3,
  }),
});

const CIRCLE_RADIUS_LINE_SKETCH_STYLE = new Style({
  stroke: new Stroke({
    color: DRAWING_PRESET_COLORS.circle.sketch,
    width: 3,
    lineDash: [8, 8],
  }),
});

/**
 * Headless hook for OLSX manual circle drawing.
 */
export function useOLSXCircleDraw({
  id = "circle",
  active = true,
  style,
  onComplete,
  onDelete,
}: UseOLSXCircleDrawProps) {
  const { mapRef } = useMapRefsContext();
  const { latestSourceRef, vectorSourceRef } = useOLSXDrawLatestSourceRef();
  const history = useDrawingHistory<Feature>();
  const resultSeqRef = useRef(0);
  const knownResultsRef = useRef(new Map<string, FeatureDrawingResult>());
  const centerRef = useRef<Coordinate | null>(null);
  const edgeRef = useRef<Coordinate | null>(null);
  const sketchFeatureRef = useRef<Feature<Circle> | null>(null);
  const centerDotRef = useRef<Feature<Point> | null>(null);
  const radiusLineRef = useRef<Feature<LineString> | null>(null);
  const radiusPointRef = useRef<Feature<Point> | null>(null);
  const [center, setCenter] = useState<Coordinate | null>(null);
  const [edge, setEdge] = useState<Coordinate | null>(null);

  const previewCircle = useMemo(
    () => getCirclePreviewGeometry(center, edge),
    [center, edge],
  );
  const radius = previewCircle ? getCircleRadius(previewCircle) : 0;

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
      removeFeaturesFromSource(source, [
        sketchFeatureRef.current,
        radiusLineRef.current,
        radiusPointRef.current,
      ]);
      sketchFeatureRef.current = null;
      radiusLineRef.current = null;
      radiusPointRef.current = null;
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
    const geometry = getCirclePreviewGeometry(
      centerRef.current,
      edgeRef.current,
    );
    const radiusLineCoordinates = getCircleRadiusLineCoordinates(
      centerRef.current,
      edgeRef.current,
    );
    if (!geometry) {
      removeFeaturesFromSource(source, [
        sketchFeatureRef.current,
        radiusLineRef.current,
        radiusPointRef.current,
      ]);
      sketchFeatureRef.current = null;
      radiusLineRef.current = null;
      radiusPointRef.current = null;
      return;
    }

    if (!sketchFeatureRef.current) {
      sketchFeatureRef.current = new Feature(geometry);
      sketchFeatureRef.current.setStyle(CIRCLE_SKETCH_STYLE);
      source.addFeature(sketchFeatureRef.current);
    } else {
      sketchFeatureRef.current.setGeometry(geometry);
    }

    if (radiusLineCoordinates) {
      const radiusLine = new LineString(radiusLineCoordinates);
      if (!radiusLineRef.current) {
        radiusLineRef.current = new Feature(radiusLine);
        radiusLineRef.current.setStyle(CIRCLE_RADIUS_LINE_SKETCH_STYLE);
        source.addFeature(radiusLineRef.current);
      } else {
        radiusLineRef.current.setGeometry(radiusLine);
      }

      const radiusPoint = new Point(radiusLineCoordinates[1]);
      if (!radiusPointRef.current) {
        radiusPointRef.current = new Feature(radiusPoint);
        radiusPointRef.current.setStyle(CIRCLE_RADIUS_POINT_STYLE);
        source.addFeature(radiusPointRef.current);
      } else {
        radiusPointRef.current.setGeometry(radiusPoint);
      }
    }
  }, [syncCenterDot, vectorSourceRef]);

  const completeCurrentRadius = useCallback(
    (keepCenter: boolean) => {
      const source = vectorSourceRef.current;
      const geometry = getCirclePreviewGeometry(
        centerRef.current,
        edgeRef.current,
      );
      const radiusLineCoordinates = getCircleRadiusLineCoordinates(
        centerRef.current,
        edgeRef.current,
      );
      if (!source || !geometry || !radiusLineCoordinates) {
        clearSketch(!keepCenter);
        return;
      }

      const feature = new Feature(geometry.clone());
      feature.setStyle(
        (style as StyleLike | undefined) ?? CIRCLE_FEATURE_STYLE,
      );
      const result = createCircleDrawingResult({
        id: `${id}:result:${resultSeqRef.current++}`,
        feature,
      }) as FeatureDrawingResult;
      const centerDot = new Feature(new Point(geometry.getCenter()));
      centerDot.setStyle(CIRCLE_CENTER_DOT_STYLE);
      const radiusLine = new Feature(new LineString(radiusLineCoordinates));
      radiusLine.setStyle(CIRCLE_RADIUS_LINE_STYLE);
      const radiusPoint = new Feature(new Point(radiusLineCoordinates[1]));
      radiusPoint.setStyle(CIRCLE_RADIUS_POINT_STYLE);
      result.coordinate = radiusLineCoordinates[1].slice() as Coordinate;
      result.attachments = [centerDot, radiusLine, radiusPoint];

      setDrawingIdOnFeatures(result);
      knownResultsRef.current.set(result.id, result);
      clearSketch(!keepCenter);
      if (keepCenter) syncCenterDot();
      history.complete(result);
      onComplete?.(result);
    },
    [
      clearSketch,
      history,
      id,
      onComplete,
      style,
      syncCenterDot,
      vectorSourceRef,
    ],
  );

  const handleDelete = useCallback(
    (result: DrawingResult<Feature>) => {
      history.deleteResult(result.id);
      onDelete?.(result);
    },
    [history, onDelete],
  );

  const clearHistory = history.clear;
  const clearAllDrawings = useCallback(() => {
    clearSketch(true);
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
      kind: "circle",
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      cancel: () => clearSketch(true),
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
    viewport.style.cursor = getDrawingPresetCursor("circle");

    const clickGuard = createClickOnlyPointerGuard();

    const handlePointerDown = (event: PointerEvent) => {
      clickGuard.pointerDown(event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!clickGuard.pointerUp(event)) return;

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
      clickGuard.pointerMove(event);

      if (!centerRef.current) return;
      setNextEdge(getEventCoordinate(map, event));
      queueMicrotask(syncSketchFeature);
    };

    const handlePointerCancel = () => {
      clickGuard.reset();
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      clearSketch(true);
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

    viewport.addEventListener("pointerdown", handlePointerDown);
    viewport.addEventListener("pointerup", handlePointerUp);
    viewport.addEventListener("pointermove", handlePointerMove);
    viewport.addEventListener("pointercancel", handlePointerCancel);
    viewport.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointerup", handlePointerUp);
      viewport.removeEventListener("pointermove", handlePointerMove);
      viewport.removeEventListener("pointercancel", handlePointerCancel);
      viewport.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      viewport.style.cursor = previousCursor;
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
      removeFeaturesFromSource(source, [
        sketchFeatureRef.current,
        centerDotRef.current,
        radiusLineRef.current,
        radiusPointRef.current,
      ]);
      knownResults.forEach((result) => {
        removeFeaturesFromSource(source, [
          result.feature,
          ...(result.attachments ?? []),
        ]);
      });
    };
  }, [latestSourceRef]);

  return {
    center,
    edge,
    radius,
    results: history.results,
    handleDelete,
  };
}
