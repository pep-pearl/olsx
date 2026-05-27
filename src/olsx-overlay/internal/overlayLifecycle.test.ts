import assert from "node:assert/strict";
import test from "node:test";
import { cleanupOverlay } from "./overlayLifecycle";

test("cleanupOverlay hides, removes, and detaches the overlay element", () => {
  const calls: string[] = [];
  const overlay = {
    setPosition: (position: undefined) => {
      calls.push(`position:${String(position)}`);
    },
    setElement: (nextElement: HTMLElement | undefined) => {
      calls.push(`element:${String(nextElement)}`);
    },
  };
  const map = {
    removeOverlay: (target: typeof overlay) => {
      assert.equal(target, overlay);
      calls.push("remove");
    },
  };

  cleanupOverlay({ map, overlay });

  assert.deepEqual(calls, [
    "position:undefined",
    "remove",
    "element:undefined",
  ]);
});

test("cleanupOverlay is safe when called more than once", () => {
  const calls: string[] = [];
  const overlay = {
    setPosition: (position: undefined) => {
      calls.push(`position:${String(position)}`);
    },
    setElement: (nextElement: HTMLElement | undefined) => {
      calls.push(`element:${String(nextElement)}`);
    },
  };
  const map = {
    removeOverlay: () => {
      calls.push("remove");
    },
  };

  cleanupOverlay({ map, overlay });
  cleanupOverlay({ map, overlay });

  assert.deepEqual(calls, [
    "position:undefined",
    "remove",
    "element:undefined",
    "position:undefined",
    "remove",
    "element:undefined",
  ]);
});
