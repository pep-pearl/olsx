import assert from "node:assert/strict";
import test from "node:test";
import {
  createAreaDrawingResult,
  createCircleDrawingResult,
  createDistanceDrawingResult,
  formatDrawingArea,
  formatDrawingLength,
  formatDrawingMeters,
  getLineSegmentMeasurements,
  isDrawingCompletable,
} from "./measurement";
import Feature from "ol/Feature";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

test("formatDrawingLength keeps short distances in meters", () => {
  assert.equal(formatDrawingLength(52.4), "52 m");
});

test("formatDrawingMeters keeps one decimal meter precision", () => {
  assert.equal(formatDrawingMeters(477.14), "477.1 m");
});

test("formatDrawingLength formats long distances in kilometers", () => {
  assert.equal(formatDrawingLength(1234), "1.23 km");
});

test("formatDrawingArea formats square meters and square kilometers", () => {
  assert.equal(formatDrawingArea(900), "900 m2");
  assert.equal(formatDrawingArea(1250000), "1.25 km2");
});

test("isDrawingCompletable follows minimum points by drawing kind", () => {
  assert.equal(isDrawingCompletable("distance", 1), false);
  assert.equal(isDrawingCompletable("distance", 2), true);
  assert.equal(isDrawingCompletable("area", 2), false);
  assert.equal(isDrawingCompletable("area", 3), true);
  assert.equal(isDrawingCompletable("circle", 1), false);
  assert.equal(isDrawingCompletable("circle", 2), true);
});

test("createDistanceDrawingResult creates a labeled result near the last point", () => {
  const geometry = new LineString([
    [0, 0],
    [0, 100],
  ]);
  const feature = new Feature({ geometry });
  const result = createDistanceDrawingResult({
    id: "distance-1",
    feature,
    createdAt: 1,
  });

  assert.equal(result.id, "distance-1");
  assert.equal(result.kind, "distance");
  assert.equal(result.label.endsWith("m"), true);
  assert.deepEqual(result.coordinate, [0, 100]);
});

test("getLineSegmentMeasurements creates one decimal labels at segment midpoints", () => {
  const segments = getLineSegmentMeasurements([
    [0, 0],
    [0, 100],
    [100, 100],
  ]);

  assert.equal(segments.length, 2);
  assert.equal(segments[0].label.endsWith("m"), true);
  assert.deepEqual(segments[0].coordinate, [0, 50]);
  assert.deepEqual(segments[1].coordinate, [50, 100]);
});

test("createAreaDrawingResult creates an area result at the polygon interior", () => {
  const geometry = new Polygon([
    [
      [0, 0],
      [0, 100],
      [100, 100],
      [0, 0],
    ],
  ]);
  const feature = new Feature({ geometry });
  const result = createAreaDrawingResult({
    id: "area-1",
    feature,
    createdAt: 1,
  });

  assert.equal(result.id, "area-1");
  assert.equal(result.kind, "area");
  assert.equal(result.label.endsWith("m2"), true);
  assert.equal(result.coordinate.length, 2);
});

test("createCircleDrawingResult creates a radius result near the circle edge", () => {
  const geometry = new Circle([0, 0], 100);
  const feature = new Feature({ geometry });
  const result = createCircleDrawingResult({
    id: "circle-1",
    feature,
    createdAt: 1,
  });

  assert.equal(result.id, "circle-1");
  assert.equal(result.kind, "circle");
  assert.equal(result.label, "100.0 m");
  assert.deepEqual(result.coordinate, [100, 0]);
});
