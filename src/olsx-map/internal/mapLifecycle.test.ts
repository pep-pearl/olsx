import assert from "node:assert/strict";
import test from "node:test";
import { mountMap } from "./mapLifecycle";

test("OLSXMap mount cleanup calls map.dispose and clears refs", () => {
  let disposed = false;
  const readyStates: boolean[] = [];
  const target = {} as HTMLElement;
  const mapRef = { current: null as null | { dispose: () => void } };
  const viewRef = { current: { view: true } as unknown };

  const cleanup = mountMap({
    target,
    controls: [],
    mapRef,
    viewRef,
    createMap: () => ({
      dispose: () => {
        disposed = true;
      },
    }),
    setReady: (isReady) => {
      readyStates.push(isReady);
    },
  });

  assert.ok(mapRef.current);
  assert.deepEqual(readyStates, [true]);

  cleanup();

  assert.equal(disposed, true);
  assert.equal(mapRef.current, null);
  assert.equal(viewRef.current, null);
  assert.deepEqual(readyStates, [true, false]);
});
