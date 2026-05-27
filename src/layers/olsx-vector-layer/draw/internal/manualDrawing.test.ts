import assert from "node:assert/strict";
import test from "node:test";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import {
  getAreaPreviewCoordinates,
  getCompletedAreaCoordinates,
  getCompletedDistanceCoordinates,
  getCirclePreviewGeometry,
  getCircleRadiusLineCoordinates,
  getDistancePreviewCoordinates,
  isManualDrawingCompletable,
  setDrawingIdOnFeatures,
  syncDrawingResultsToSource,
  type FeatureDrawingResult,
} from "./manualDrawing";

function result(id: string): FeatureDrawingResult {
  return {
    id,
    kind: "distance",
    feature: new Feature(new Point([0, 0])),
    attachments: [new Feature(new Point([1, 1]))],
    value: 1,
    label: "1 m",
    coordinate: [0, 0],
    createdAt: 1,
  };
}

test("distance completion requires two clicked points even when a preview coordinate exists", () => {
  assert.equal(isManualDrawingCompletable("distance", 1), false);
  assert.deepEqual(getDistancePreviewCoordinates([[0, 0]], [10, 10]), [
    [0, 0],
    [10, 10],
  ]);
});

test("distance completion uses the last clicked point instead of preview or contextmenu coordinates", () => {
  const clicked = [
    [0, 0],
    [10, 0],
  ];

  assert.deepEqual(getCompletedDistanceCoordinates(clicked), [
    [0, 0],
    [10, 0],
  ]);
  assert.equal(
    getCompletedDistanceCoordinates(clicked).some(
      ([x, y]) => x === 15 && y === 0,
    ),
    false,
  );
  assert.equal(
    getCompletedDistanceCoordinates(clicked).some(
      ([x, y]) => x === 99 && y === 99,
    ),
    false,
  );
});

test("area completion requires three clicked points and closes the preview polygon", () => {
  assert.equal(isManualDrawingCompletable("area", 2), false);
  assert.equal(isManualDrawingCompletable("area", 3), true);
  assert.deepEqual(
    getAreaPreviewCoordinates(
      [
        [0, 0],
        [10, 0],
        [10, 10],
      ],
      [0, 10],
    ),
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  );
});

test("area completion uses clicked points instead of preview or contextmenu coordinates", () => {
  const clicked = [
    [0, 0],
    [10, 0],
    [10, 10],
  ];

  assert.deepEqual(getCompletedAreaCoordinates(clicked), [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 0],
  ]);
  assert.equal(
    getCompletedAreaCoordinates(clicked).some(
      ([x, y]) => x === 99 && y === 99,
    ),
    false,
  );
});

test("circle preview needs a center and a distinct edge coordinate", () => {
  assert.equal(getCirclePreviewGeometry([0, 0], null), null);
  assert.equal(getCirclePreviewGeometry([0, 0], [0, 0]), null);
  assert.equal(getCirclePreviewGeometry([0, 0], [3, 4])?.getRadius(), 5);
});

test("circle radius line connects the center to the clicked radius point", () => {
  assert.equal(getCircleRadiusLineCoordinates([0, 0], [0, 0]), null);
  assert.deepEqual(getCircleRadiusLineCoordinates([0, 0], [3, 4]), [
    [0, 0],
    [3, 4],
  ]);
});

test("source sync adds and removes main features and attachments by drawing id", () => {
  const source = new VectorSource();
  const first = result("first");
  const second = result("second");

  setDrawingIdOnFeatures(first);
  setDrawingIdOnFeatures(second);

  syncDrawingResultsToSource(source, [first, second], new Set(["first", "second"]));
  assert.equal(source.getFeatures().length, 4);
  assert.equal(first.attachments?.[0].get("drawingId"), "first");

  syncDrawingResultsToSource(source, [first, second], new Set(["second"]));
  assert.equal(source.hasFeature(first.feature), false);
  assert.equal(source.hasFeature(first.attachments![0]), false);
  assert.equal(source.hasFeature(second.feature), true);
  assert.equal(source.hasFeature(second.attachments![0]), true);
});
