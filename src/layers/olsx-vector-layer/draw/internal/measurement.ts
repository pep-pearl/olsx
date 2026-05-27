import type { DrawingKind } from "../types";
import type Feature from "ol/Feature";
import type { Coordinate } from "ol/coordinate";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import { getArea, getLength } from "ol/sphere";
import type { DrawingResult } from "./drawingHistory";

const MINIMUM_POINTS_BY_KIND: Record<DrawingKind, number> = {
  distance: 2,
  area: 3,
  circle: 2,
};

function formatScaledValue(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function getMidpoint(start: Coordinate, end: Coordinate): Coordinate {
  return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
}

function getSegmentLength(start: Coordinate, end: Coordinate) {
  return getLength(new LineString([start, end]));
}

export function formatDrawingMeters(meters: number) {
  return `${meters.toFixed(1)} m`;
}

export function formatDrawingLength(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${formatScaledValue(meters / 1000)} km`;
}

export type LineSegmentMeasurement = {
  index: number;
  value: number;
  label: string;
  coordinate: Coordinate;
};

export function getLineSegmentMeasurements(coordinates: Coordinate[]) {
  const segments: LineSegmentMeasurement[] = [];

  for (let index = 1; index < coordinates.length; index += 1) {
    const start = coordinates[index - 1];
    const end = coordinates[index];
    const value = getSegmentLength(start, end);

    segments.push({
      index: index - 1,
      value,
      label: formatDrawingMeters(value),
      coordinate: getMidpoint(start, end),
    });
  }

  return segments;
}

export function formatDrawingArea(squareMeters: number) {
  if (squareMeters < 1000000) {
    return `${Math.round(squareMeters)} m2`;
  }

  return `${formatScaledValue(squareMeters / 1000000)} km2`;
}

export function getDrawingMinimumPoints(kind: DrawingKind) {
  return MINIMUM_POINTS_BY_KIND[kind];
}

export function isDrawingCompletable(kind: DrawingKind, pointCount: number) {
  return pointCount >= getDrawingMinimumPoints(kind);
}

export function getLastCoordinateFromLineString(geometry: LineString) {
  const coordinates = geometry.getCoordinates();
  return coordinates.at(-1) ?? null;
}

export function getLineStringLength(geometry: LineString) {
  return getLength(geometry);
}

export function getPolygonArea(geometry: Polygon) {
  return getArea(geometry);
}

export function getCircleRadius(geometry: Circle) {
  return geometry.getRadius();
}

export function createDistanceDrawingResult({
  id,
  feature,
  createdAt = Date.now(),
}: {
  id: string;
  feature: Feature;
  createdAt?: number;
}): DrawingResult<Feature> {
  const geometry = feature.getGeometry();

  if (!(geometry instanceof LineString)) {
    throw new Error("Distance drawing result requires a LineString geometry.");
  }

  const value = getLength(geometry);
  const coordinate = getLastCoordinateFromLineString(geometry);

  if (!coordinate) {
    throw new Error("Distance drawing result requires at least one coordinate.");
  }

  return {
    id,
    kind: "distance",
    feature,
    value,
    label: formatDrawingLength(value),
    coordinate: coordinate as Coordinate,
    createdAt,
  };
}

export function createAreaDrawingResult({
  id,
  feature,
  createdAt = Date.now(),
}: {
  id: string;
  feature: Feature;
  createdAt?: number;
}): DrawingResult<Feature> {
  const geometry = feature.getGeometry();

  if (!(geometry instanceof Polygon)) {
    throw new Error("Area drawing result requires a Polygon geometry.");
  }

  const value = getPolygonArea(geometry);

  return {
    id,
    kind: "area",
    feature,
    value,
    label: formatDrawingArea(value),
    coordinate: geometry.getInteriorPoint().getCoordinates().slice(0, 2),
    createdAt,
  };
}

export function createCircleDrawingResult({
  id,
  feature,
  createdAt = Date.now(),
}: {
  id: string;
  feature: Feature;
  createdAt?: number;
}): DrawingResult<Feature> {
  const geometry = feature.getGeometry();

  if (!(geometry instanceof Circle)) {
    throw new Error("Circle drawing result requires a Circle geometry.");
  }

  const center = geometry.getCenter();
  const radius = getCircleRadius(geometry);

  return {
    id,
    kind: "circle",
    feature,
    value: radius,
    label: formatDrawingMeters(radius),
    coordinate: [center[0] + radius, center[1]],
    createdAt,
  };
}
