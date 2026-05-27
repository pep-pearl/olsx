/**
 * @ai-purpose React hook for managing drawing tool selection and history actions state without UI.
 * @ai-entry false
 * @ai-domain state
 * @ai-depends DrawingKind
 * @ai-used-by DrawingToolbar, OLSXVectorLayer.Draw headless integrations
 * @ai-keywords useDrawingControls, setActiveKind, undo, redo, activeKind
 */

import { useCallback, useState } from "react";
import type { DrawingKind } from "../../layers/olsx-vector-layer/draw/types";

export type DrawingControlKind = DrawingKind;

export type DrawingControlsOptions = {
  activeKind?: DrawingControlKind | null;
  defaultActiveKind?: DrawingControlKind | null;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
  onActiveKindChange?: (kind: DrawingControlKind | null) => void;
  onCancel?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
};

export type DrawingControls = {
  activeKind: DrawingControlKind | null;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  setActiveKind: (kind: DrawingControlKind | null) => void;
  toggleKind: (kind: DrawingControlKind) => void;
  cancel: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

export function useDrawingControls(
  options: DrawingControlsOptions = {},
): DrawingControls {
  const {
    activeKind,
    defaultActiveKind = null,
    canUndo = false,
    canRedo = false,
    disabled = false,
    onActiveKindChange,
    onCancel,
    onUndo,
    onRedo,
    onClear,
  } = options;
  const [uncontrolledActiveKind, setUncontrolledActiveKind] =
    useState<DrawingControlKind | null>(defaultActiveKind);
  const currentActiveKind = activeKind ?? uncontrolledActiveKind;

  const setActiveKind = useCallback(
    (kind: DrawingControlKind | null) => {
      if (disabled) return;

      if (activeKind === undefined) {
        setUncontrolledActiveKind(kind);
      }

      onActiveKindChange?.(kind);
    },
    [activeKind, disabled, onActiveKindChange],
  );

  const toggleKind = useCallback(
    (kind: DrawingControlKind) => {
      setActiveKind(currentActiveKind === kind ? null : kind);
    },
    [currentActiveKind, setActiveKind],
  );

  const cancel = useCallback(() => {
    if (disabled) return;
    setActiveKind(null);
    onCancel?.();
  }, [disabled, onCancel, setActiveKind]);

  const undo = useCallback(() => {
    if (disabled || !canUndo) return;
    onUndo?.();
  }, [canUndo, disabled, onUndo]);

  const redo = useCallback(() => {
    if (disabled || !canRedo) return;
    onRedo?.();
  }, [canRedo, disabled, onRedo]);

  const clear = useCallback(() => {
    if (disabled) return;
    onClear?.();
  }, [disabled, onClear]);

  return {
    activeKind: currentActiveKind,
    canUndo,
    canRedo,
    disabled,
    setActiveKind,
    toggleKind,
    cancel,
    undo,
    redo,
    clear,
  };
}
