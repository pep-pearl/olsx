import assert from "node:assert/strict";
import test from "node:test";
import Point from "ol/geom/Point";
import { FEATURE_PROPERTIES_KEY } from "../../../core/constants";
import { removeFeatures, upsertFeatures } from "./featuresDiff";

type Place = {
  id: string;
  name: string;
  coordinate: [number, number];
};

test("upsertFeatures adds, removes, and updates features by data id", () => {
  const added: unknown[] = [];
  const removed: unknown[] = [];
  const featuresById = new Map();
  const vectorSource = {
    addFeature: (feature: unknown) => added.push(feature),
    removeFeature: (feature: unknown) => removed.push(feature),
  };
  const getId = (place: Place) => place.id;
  const getGeometry = (place: Place) => new Point(place.coordinate);

  const firstFeatures = upsertFeatures({
    data: [
      { id: "a", name: "A", coordinate: [0, 0] },
      { id: "b", name: "B", coordinate: [1, 1] },
    ],
    getId,
    getGeometry,
    layerId: "places",
    featuresId: "markers",
    type: "marker",
    vectorSource,
    featuresById,
  });

  assert.equal(added.length, 2);
  assert.equal(removed.length, 0);

  const featureA = featuresById.get("a");

  const nextFeatures = upsertFeatures({
    data: [
      { id: "a", name: "A updated", coordinate: [2, 2] },
      { id: "c", name: "C", coordinate: [3, 3] },
    ],
    getId,
    getGeometry,
    layerId: "places",
    featuresId: "markers",
    type: "marker",
    vectorSource,
    featuresById,
  });

  assert.equal(added.length, 3);
  assert.equal(removed.length, 1);
  assert.equal(featuresById.get("a"), featureA);
  assert.equal(featureA.get(FEATURE_PROPERTIES_KEY).name, "A updated");
  assert.deepEqual(featureA.getGeometry()?.getCoordinates(), [2, 2]);
  assert.equal(firstFeatures.length, 2);
  assert.equal(nextFeatures.length, 2);

  removeFeatures(vectorSource, featuresById);

  assert.equal(featuresById.size, 0);
  assert.equal(removed.length, 3);
});
