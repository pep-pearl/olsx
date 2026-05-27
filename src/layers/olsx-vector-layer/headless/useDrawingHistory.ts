/**
 * @ai-purpose React hook for managing drawing results history (undo/redo/clear) for drawing sessions.
 * @ai-entry false
 * @ai-domain state
 * @ai-depends drawingHistory
 * @ai-used-by OLSXAreaDraw, OLSXCircleDraw, OLSXDistanceDraw
 * @ai-keywords useDrawingHistory, DrawingHistory, undo, redo, complete, deleteResult
 */

import { useCallback, useMemo, useReducer } from "react";
import {
  applyDrawingHistoryAction,
  createDrawingHistoryState,
  type DrawingHistoryState,
  type DrawingResult,
} from "../draw/internal/drawingHistory";

export type { DrawingResult };

export type DrawingHistory<TFeature = unknown> = {
  results: Array<DrawingResult<TFeature>>;
  canUndo: boolean;
  canRedo: boolean;
  complete: (result: DrawingResult<TFeature>) => void;
  deleteResult: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

function reducer<TFeature>(
  state: DrawingHistoryState<TFeature>,
  action:
    | { type: "complete"; result: DrawingResult<TFeature> }
    | { type: "delete"; id: string }
    | { type: "undo" }
    | { type: "redo" }
    | { type: "clear" },
) {
  return applyDrawingHistoryAction(state, action);
}

export function useDrawingHistory<TFeature = unknown>(
  initialResults: Array<DrawingResult<TFeature>> = [],
): DrawingHistory<TFeature> {
  const [state, dispatch] = useReducer(
    reducer<TFeature>,
    initialResults,
    createDrawingHistoryState,
  );

  const complete = useCallback((result: DrawingResult<TFeature>) => {
    dispatch({ type: "complete", result });
  }, []);

  const deleteResult = useCallback((id: string) => {
    dispatch({ type: "delete", id });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "undo" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "redo" });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  return useMemo(
    () => ({
      results: state.results,
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
      complete,
      deleteResult,
      undo,
      redo,
      clear,
    }),
    [clear, complete, deleteResult, redo, state, undo],
  );
}
