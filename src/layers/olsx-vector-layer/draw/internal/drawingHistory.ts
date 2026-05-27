import type { Coordinate } from "ol/coordinate";
import type { DrawingKind } from "../types";

export type DrawingResult<TFeature = unknown> = {
  id: string;
  kind: DrawingKind;
  feature: TFeature;
  value: number;
  label: string;
  coordinate: Coordinate;
  createdAt: number;
};

type CompleteHistoryEntry<TFeature> = {
  type: "complete";
  result: DrawingResult<TFeature>;
};

type DeleteHistoryEntry<TFeature> = {
  type: "delete";
  result: DrawingResult<TFeature>;
  index: number;
};

type DrawingHistoryEntry<TFeature> =
  | CompleteHistoryEntry<TFeature>
  | DeleteHistoryEntry<TFeature>;

export type DrawingHistoryState<TFeature = unknown> = {
  results: Array<DrawingResult<TFeature>>;
  undoStack: Array<DrawingHistoryEntry<TFeature>>;
  redoStack: Array<DrawingHistoryEntry<TFeature>>;
};

export type DrawingHistoryAction<TFeature = unknown> =
  | { type: "complete"; result: DrawingResult<TFeature> }
  | { type: "delete"; id: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "clear" };

function insertAt<T>(items: T[], index: number, item: T) {
  return [...items.slice(0, index), item, ...items.slice(index)];
}

function removeById<TFeature>(
  results: Array<DrawingResult<TFeature>>,
  id: string,
) {
  const index = results.findIndex((result) => result.id === id);
  if (index === -1) return null;

  return {
    index,
    result: results[index],
    results: results.filter((result) => result.id !== id),
  };
}

function undoEntry<TFeature>(
  results: Array<DrawingResult<TFeature>>,
  entry: DrawingHistoryEntry<TFeature>,
) {
  if (entry.type === "complete") {
    return results.filter((result) => result.id !== entry.result.id);
  }

  return insertAt(results, entry.index, entry.result);
}

function redoEntry<TFeature>(
  results: Array<DrawingResult<TFeature>>,
  entry: DrawingHistoryEntry<TFeature>,
) {
  if (entry.type === "complete") {
    return [...results, entry.result];
  }

  return results.filter((result) => result.id !== entry.result.id);
}

export function createDrawingHistoryState<TFeature = unknown>(
  results: Array<DrawingResult<TFeature>> = [],
): DrawingHistoryState<TFeature> {
  return {
    results,
    undoStack: [],
    redoStack: [],
  };
}

export function applyDrawingHistoryAction<TFeature>(
  state: DrawingHistoryState<TFeature>,
  action: DrawingHistoryAction<TFeature>,
): DrawingHistoryState<TFeature> {
  if (action.type === "complete") {
    return {
      results: [...state.results, action.result],
      undoStack: [...state.undoStack, { type: "complete", result: action.result }],
      redoStack: [],
    };
  }

  if (action.type === "delete") {
    const removed = removeById(state.results, action.id);
    if (!removed) return state;

    return {
      results: removed.results,
      undoStack: [
        ...state.undoStack,
        { type: "delete", result: removed.result, index: removed.index },
      ],
      redoStack: [],
    };
  }

  if (action.type === "undo") {
    const entry = state.undoStack.at(-1);
    if (!entry) return state;

    return {
      results: undoEntry(state.results, entry),
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, entry],
    };
  }

  if (action.type === "redo") {
    const entry = state.redoStack.at(-1);
    if (!entry) return state;

    return {
      results: redoEntry(state.results, entry),
      undoStack: [...state.undoStack, entry],
      redoStack: state.redoStack.slice(0, -1),
    };
  }

  return createDrawingHistoryState();
}
