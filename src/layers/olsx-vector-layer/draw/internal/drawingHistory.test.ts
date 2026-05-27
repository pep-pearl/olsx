import assert from "node:assert/strict";
import test from "node:test";
import {
  applyDrawingHistoryAction,
  createDrawingHistoryState,
  type DrawingResult,
} from "./drawingHistory";

function result(id: string): DrawingResult {
  return {
    id,
    kind: "distance",
    feature: { id },
    value: 10,
    label: "10 m",
    coordinate: [0, 0],
    createdAt: 1,
  };
}

test("drawing history completes, deletes, undoes, and redoes results", () => {
  const first = result("first");
  const second = result("second");

  let state = createDrawingHistoryState();
  state = applyDrawingHistoryAction(state, { type: "complete", result: first });
  state = applyDrawingHistoryAction(state, { type: "complete", result: second });

  assert.deepEqual(
    state.results.map((item) => item.id),
    ["first", "second"],
  );

  state = applyDrawingHistoryAction(state, { type: "delete", id: "first" });
  assert.deepEqual(
    state.results.map((item) => item.id),
    ["second"],
  );

  state = applyDrawingHistoryAction(state, { type: "undo" });
  assert.deepEqual(
    state.results.map((item) => item.id),
    ["first", "second"],
  );

  state = applyDrawingHistoryAction(state, { type: "redo" });
  assert.deepEqual(
    state.results.map((item) => item.id),
    ["second"],
  );
});

test("new complete clears redo stack", () => {
  const first = result("first");
  const second = result("second");

  let state = createDrawingHistoryState([first]);
  state = applyDrawingHistoryAction(state, { type: "delete", id: "first" });
  state = applyDrawingHistoryAction(state, { type: "undo" });
  state = applyDrawingHistoryAction(state, { type: "complete", result: second });
  state = applyDrawingHistoryAction(state, { type: "redo" });

  assert.deepEqual(
    state.results.map((item) => item.id),
    ["first", "second"],
  );
});

test("drawing history can delete multiple completed results in sequence", () => {
  const first = result("first");
  const second = result("second");

  let state = createDrawingHistoryState();
  state = applyDrawingHistoryAction(state, { type: "complete", result: first });
  state = applyDrawingHistoryAction(state, { type: "complete", result: second });
  state = applyDrawingHistoryAction(state, { type: "delete", id: "first" });
  state = applyDrawingHistoryAction(state, { type: "delete", id: "second" });

  assert.deepEqual(state.results, []);
});
