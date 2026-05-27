import assert from "node:assert/strict";
import test from "node:test";
import {
  getDrawingCommandState,
  registerDrawingCommands,
  runDrawingCommand,
  subscribeDrawingCommandState,
  updateDrawingCommandState,
} from "./drawingCommandBus";

test("drawing command bus aggregates undo and redo state", () => {
  const states: Array<{ canUndo: boolean; canRedo: boolean }> = [];
  const unsubscribeState = subscribeDrawingCommandState(() => {
    states.push(getDrawingCommandState());
  });

  const unregisterFirst = registerDrawingCommands("first", {
    kind: "distance",
    canUndo: false,
    canRedo: false,
    cancel: () => undefined,
    undo: () => undefined,
    redo: () => undefined,
    clear: () => undefined,
  });
  const unregisterSecond = registerDrawingCommands("second", {
    kind: "area",
    canUndo: true,
    canRedo: false,
    cancel: () => undefined,
    undo: () => undefined,
    redo: () => undefined,
    clear: () => undefined,
  });

  assert.deepEqual(states.at(-1), { canUndo: true, canRedo: false });

  updateDrawingCommandState("first", { canUndo: false, canRedo: true });
  assert.deepEqual(states.at(-1), { canUndo: true, canRedo: true });

  unregisterSecond();
  assert.deepEqual(states.at(-1), { canUndo: false, canRedo: true });

  unregisterFirst();
  unsubscribeState();
});

test("drawing command bus runs clear for every registration and undo for the latest undoable one", () => {
  const calls: string[] = [];
  const unregisterFirst = registerDrawingCommands("first-command-test", {
    kind: "distance",
    canUndo: true,
    canRedo: false,
    cancel: () => calls.push("first:cancel"),
    undo: () => calls.push("first:undo"),
    redo: () => calls.push("first:redo"),
    clear: () => calls.push("first:clear"),
  });
  const unregisterSecond = registerDrawingCommands("second-command-test", {
    kind: "circle",
    canUndo: true,
    canRedo: false,
    cancel: () => calls.push("second:cancel"),
    undo: () => calls.push("second:undo"),
    redo: () => calls.push("second:redo"),
    clear: () => calls.push("second:clear"),
  });

  runDrawingCommand("undo");
  runDrawingCommand("clear");

  assert.deepEqual(calls, ["second:undo", "first:clear", "second:clear"]);

  unregisterSecond();
  unregisterFirst();
});

test("drawing command bus prefers the active drawing kind for undo and redo", () => {
  const calls: string[] = [];
  const unregisterDistance = registerDrawingCommands("preferred-distance", {
    kind: "distance",
    canUndo: true,
    canRedo: true,
    cancel: () => calls.push("distance:cancel"),
    undo: () => calls.push("distance:undo"),
    redo: () => calls.push("distance:redo"),
    clear: () => calls.push("distance:clear"),
  });
  const unregisterCircle = registerDrawingCommands("preferred-circle", {
    kind: "circle",
    canUndo: true,
    canRedo: true,
    cancel: () => calls.push("circle:cancel"),
    undo: () => calls.push("circle:undo"),
    redo: () => calls.push("circle:redo"),
    clear: () => calls.push("circle:clear"),
  });

  runDrawingCommand("undo", "distance");
  runDrawingCommand("redo", "distance");
  runDrawingCommand("cancel", "distance");

  assert.deepEqual(calls, [
    "distance:undo",
    "distance:redo",
    "distance:cancel",
  ]);

  unregisterCircle();
  unregisterDistance();
});
