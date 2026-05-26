import assert from "node:assert/strict";
import test from "node:test";
import { mountBaseLayer } from "./baseLayerLifecycle";

function createLayer(role: string) {
  return {
    get: (key: string) => (key === "role" ? role : undefined),
  };
}

test("mountBaseLayer inserts next base layer and removes existing base layers", () => {
  const oldBaseLayer = createLayer("base");
  const nextBaseLayer = createLayer("base");
  const overlayLayer = createLayer("overlay");
  const layers = [oldBaseLayer, overlayLayer];
  const removed: unknown[] = [];

  mountBaseLayer(
    {
      getLayers: () => ({
        getArray: () => layers,
        insertAt: (index, layer) => {
          layers.splice(index, 0, layer);
        },
      }),
      removeLayer: (layer) => {
        removed.push(layer);
        layers.splice(layers.indexOf(layer), 1);
      },
    },
    nextBaseLayer,
  );

  assert.equal(layers.includes(nextBaseLayer), true);
  assert.equal(layers.includes(oldBaseLayer), false);
  assert.equal(layers.includes(overlayLayer), true);
  assert.deepEqual(removed, [oldBaseLayer]);
});
