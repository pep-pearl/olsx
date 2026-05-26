import assert from "node:assert/strict";
import test from "node:test";
import {
  clearMapListeners,
  createListenerRegistry,
  registerMapListener,
} from "./listenerRegistry";

test("listener registry stores map listeners and unregisters cleanup", () => {
  const registry = createListenerRegistry();
  const unregistered: string[] = [];
  const map = {
    on: (type: string) => ({
      type,
      target: {},
      listener: () => undefined,
      bindTo: undefined,
      callOnce: false,
      disposed: false,
      dispose: () => undefined,
      unlisten: () => {
        unregistered.push(type);
      },
    }),
  };

  const cleanup = registerMapListener(
    registry,
    map,
    "features:markers:click",
    "singleclick",
    () => undefined,
  );

  assert.equal(registry.get("features:markers:click")?.length, 1);

  cleanup();

  assert.equal(registry.has("features:markers:click"), false);
  assert.deepEqual(unregistered, ["singleclick"]);
});

test("clearMapListeners unregisters every stored listener", () => {
  const registry = createListenerRegistry();
  const unregistered: string[] = [];
  const map = {
    on: (type: string) => ({
      type,
      target: {},
      listener: () => undefined,
      bindTo: undefined,
      callOnce: false,
      disposed: false,
      dispose: () => undefined,
      unlisten: () => {
        unregistered.push(type);
      },
    }),
  };

  registerMapListener(registry, map, "features:markers", "singleclick", () => undefined);
  registerMapListener(registry, map, "features:markers", "pointermove", () => undefined);

  clearMapListeners(registry, "features:markers");

  assert.equal(registry.has("features:markers"), false);
  assert.deepEqual(unregistered, ["singleclick", "pointermove"]);
});
