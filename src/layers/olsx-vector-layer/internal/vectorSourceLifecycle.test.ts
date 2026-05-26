import assert from "node:assert/strict";
import test from "node:test";
import { mountVectorSource } from "./vectorSourceLifecycle";

test("mountVectorSource registers source and cleans registry on cleanup", () => {
  const source = { id: "source" };
  const setSources: unknown[] = [];
  const layer = {
    setSource: (nextSource: typeof source | null) => {
      setSources.push(nextSource);
    },
  };
  const layerRegistry = new Map([["places", layer]]);
  const sourceRegistry = new Map<string, typeof source>();
  const sourceRef = { current: null as typeof source | null };
  let clearCount = 0;

  const cleanup = mountVectorSource({
    id: "places",
    layerRegistry,
    sourceRegistry,
    sourceRef,
    createSource: () => source,
    clearFeaturesRegistry: () => {
      clearCount += 1;
    },
  });

  assert.equal(sourceRegistry.get("places"), source);
  assert.equal(sourceRef.current, source);
  assert.deepEqual(setSources, [source]);
  assert.equal(clearCount, 1);

  cleanup?.();

  assert.equal(sourceRegistry.has("places"), false);
  assert.equal(sourceRef.current, null);
  assert.deepEqual(setSources, [source, null]);
  assert.equal(clearCount, 2);
});
