import assert from "node:assert/strict";
import test from "node:test";
import { mountLayerById } from "./layerLifecycle";

test("mountLayerById adds, removes, and cleans registry", () => {
  const layer = { id: "layer" };
  const added: unknown[] = [];
  const removed: unknown[] = [];
  const registry = new Map<string, typeof layer>();
  const layerRef = { current: null as typeof layer | null };
  const readyStates: boolean[] = [];

  const cleanup = mountLayerById({
    id: "places",
    map: {
      addLayer: (nextLayer) => added.push(nextLayer),
      removeLayer: (nextLayer) => removed.push(nextLayer),
    },
    layerRegistry: registry,
    layerRef,
    createLayer: () => layer,
    setReady: (isReady) => readyStates.push(isReady),
  });

  assert.deepEqual(added, [layer]);
  assert.equal(registry.get("places"), layer);
  assert.equal(layerRef.current, layer);

  cleanup?.();

  assert.deepEqual(removed, [layer]);
  assert.equal(registry.has("places"), false);
  assert.equal(layerRef.current, null);
  assert.deepEqual(readyStates, [true, false]);
});
