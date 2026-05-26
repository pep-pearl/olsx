import assert from "node:assert/strict";
import test from "node:test";
import { syncOverlayPosition } from "./overlayPosition";

test("syncOverlayPosition clears position when hidden or coordinate is missing", () => {
  const positions: unknown[] = [];

  syncOverlayPosition({
    overlay: {
      setPosition: (coordinate) => positions.push(coordinate),
      panIntoView: () => undefined,
    },
    coordinate: [1, 2],
    visible: false,
    autoPan: false,
  });

  syncOverlayPosition({
    overlay: {
      setPosition: (coordinate) => positions.push(coordinate),
      panIntoView: () => undefined,
    },
    coordinate: null,
    visible: true,
    autoPan: false,
  });

  assert.deepEqual(positions, [undefined, undefined]);
});

test("syncOverlayPosition sets coordinate and pans when visible", () => {
  const positions: unknown[] = [];
  const panOptions: unknown[] = [];

  syncOverlayPosition({
    overlay: {
      setPosition: (coordinate) => positions.push(coordinate),
      panIntoView: (options) => panOptions.push(options),
    },
    coordinate: [1, 2],
    visible: true,
    autoPan: { animation: { duration: 100 } },
  });

  assert.deepEqual(positions, [[1, 2]]);
  assert.deepEqual(panOptions, [{ animation: { duration: 100 } }]);
});
