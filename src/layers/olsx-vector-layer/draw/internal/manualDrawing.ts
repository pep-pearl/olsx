import type Feature from "ol/Feature";
import type { Coordinate } from "ol/coordinate";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import type OlVectorSource from "ol/source/Vector";
import type { DrawingKind } from "../types";
import type { DrawingResult } from "./drawingHistory";

export type DrawingFeatureBundle = {
  feature: Feature;
  attachments?: Feature[];
};

export type FeatureDrawingResult = DrawingResult<Feature> & {
  attachments?: Feature[];
};

export function isSameDrawingCoordinate(
  first: Coordinate | null | undefined,
  second: Coordinate | null | undefined,
) {
  return first?.[0] === second?.[0] && first?.[1] === second?.[1];
}

export function getDrawingFeatureBundle(
  result: FeatureDrawingResult,
): DrawingFeatureBundle {
  return {
    feature: result.feature,
    attachments: result.attachments ?? [],
  };
}

export function getDrawingResultFeatures(result: FeatureDrawingResult) {
  const bundle = getDrawingFeatureBundle(result);
  return [bundle.feature, ...(bundle.attachments ?? [])];
}

export function setDrawingIdOnFeatures(
  result: FeatureDrawingResult,
  drawingId = result.id,
) {
  getDrawingResultFeatures(result).forEach((feature) => {
    feature.set("drawingId", drawingId);
  });
}

export function syncDrawingResultsToSource(
  source: OlVectorSource,
  knownResults: Iterable<FeatureDrawingResult>,
  activeResultIds: Set<string>,
) {
  for (const result of knownResults) {
    for (const feature of getDrawingResultFeatures(result)) {
      const hasFeature = source.hasFeature(feature);

      if (activeResultIds.has(result.id) && !hasFeature) {
        source.addFeature(feature);
      }

      if (!activeResultIds.has(result.id) && hasFeature) {
        source.removeFeature(feature);
      }
    }
  }
}

export function removeFeaturesFromSource(
  source: OlVectorSource | null,
  features: Array<Feature | null | undefined>,
) {
  if (!source) return;

  features.forEach((feature) => {
    if (feature && source.hasFeature(feature)) {
      source.removeFeature(feature);
    }
  });
}

export function getDistancePreviewCoordinates(
  points: Coordinate[],
  previewCoordinate: Coordinate | null,
) {
  if (!previewCoordinate || points.length === 0) {
    return points;
  }

  const lastPoint = points.at(-1);
  if (isSameDrawingCoordinate(lastPoint, previewCoordinate)) {
    return points;
  }

  return [...points, previewCoordinate];
}

export function getCompletedDistanceCoordinates(points: Coordinate[]) {
  return points.map((coordinate) => coordinate.slice() as Coordinate);
}

export function getAreaPreviewCoordinates(
  points: Coordinate[],
  previewCoordinate: Coordinate | null,
) {
  const coordinates = getDistancePreviewCoordinates(points, previewCoordinate);

  if (coordinates.length === 0) return coordinates;

  const firstPoint = coordinates[0];
  const lastPoint = coordinates.at(-1);

  return isSameDrawingCoordinate(firstPoint, lastPoint)
    ? coordinates
    : [...coordinates, firstPoint];
}

export function getCompletedAreaCoordinates(points: Coordinate[]) {
  if (points.length === 0) return [];

  const coordinates = points.map(
    (coordinate) => coordinate.slice() as Coordinate,
  );
  const firstPoint = coordinates[0];
  const lastPoint = coordinates.at(-1);

  return isSameDrawingCoordinate(firstPoint, lastPoint)
    ? coordinates
    : [...coordinates, firstPoint.slice() as Coordinate];
}

export function getCirclePreviewGeometry(
  center: Coordinate | null,
  edge: Coordinate | null,
) {
  if (!center || !edge || isSameDrawingCoordinate(center, edge)) {
    return null;
  }

  const dx = edge[0] - center[0];
  const dy = edge[1] - center[1];
  return new Circle(center, Math.sqrt(dx * dx + dy * dy));
}

export function getCircleRadiusLineCoordinates(
  center: Coordinate | null,
  edge: Coordinate | null,
) {
  if (!center || !edge || isSameDrawingCoordinate(center, edge)) {
    return null;
  }

  return [center.slice() as Coordinate, edge.slice() as Coordinate];
}

export function isManualDrawingCompletable(
  kind: DrawingKind,
  pointCount: number,
) {
  if (kind === "distance") return pointCount >= 2;
  if (kind === "area") return pointCount >= 3;
  return pointCount >= 2;
}

export function createLineStringFromCoordinates(coordinates: Coordinate[]) {
  return new LineString(coordinates.map((coordinate) => coordinate.slice()));
}

export function createPolygonFromCoordinates(coordinates: Coordinate[]) {
  return new Polygon([coordinates.map((coordinate) => coordinate.slice())]);
}

const DEFAULT_MANUAL_DRAW_CLICK_TOLERANCE_PX = 8;

export function createClickOnlyPointerGuard(
  tolerancePx = DEFAULT_MANUAL_DRAW_CLICK_TOLERANCE_PX,
) {
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let moved = false;

  const isTrackedPointer = (event: PointerEvent) =>
    pointerId === event.pointerId;

  const isMovedBeyondTolerance = (event: PointerEvent) => {
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    return dx * dx + dy * dy > tolerancePx * tolerancePx;
  };

  return {
    pointerDown(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary) {
        pointerId = null;
        moved = false;
        return;
      }

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      moved = false;
    },

    pointerMove(event: PointerEvent) {
      if (!isTrackedPointer(event)) return;
      if (isMovedBeyondTolerance(event)) {
        moved = true;
      }
    },

    pointerUp(event: PointerEvent) {
      if (!isTrackedPointer(event)) return false;

      const shouldAccept =
        event.button === 0 && !moved && !isMovedBeyondTolerance(event);

      pointerId = null;
      moved = false;

      return shouldAccept;
    },

    reset() {
      pointerId = null;
      moved = false;
    },
  };
}
