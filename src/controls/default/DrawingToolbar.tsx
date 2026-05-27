/**
 * @ai-purpose Ready-to-use UI toolbar component for selecting drawing modes (distance, area, circle) and history actions.
 * @ai-entry false
 * @ai-domain ui
 * @ai-depends useDrawingControls, icons
 * @ai-used-by playground/App.tsx or custom consumers
 * @ai-keywords DrawingToolbar, control, draw, distance, area, circle, undo, redo
 */

import type { CSSProperties, ReactNode } from "react";
import {
  useDrawingControls,
  type DrawingControls,
  type DrawingControlsOptions,
  type DrawingControlKind,
} from "../headless";
import {
  AreaIcon,
  CancelIcon,
  CircleIcon,
  ClearIcon,
  DistanceIcon,
  RedoIcon,
  UndoIcon,
} from "./icons";
import { controlButtonStyle, controlGroupStyle } from "./styles";

export type DrawingToolbarProps = DrawingControlsOptions & {
  className?: string;
  style?: CSSProperties;
  buttonStyle?: CSSProperties;
  children?: ReactNode | ((control: DrawingControls) => ReactNode);
};

const DRAWING_KINDS: Array<{
  kind: DrawingControlKind;
  label: string;
  icon: ReactNode;
}> = [
  { kind: "distance", label: "Draw distance", icon: <DistanceIcon /> },
  { kind: "area", label: "Draw area", icon: <AreaIcon /> },
  { kind: "circle", label: "Draw radius", icon: <CircleIcon /> },
];

export function DrawingToolbar({
  className,
  style,
  buttonStyle,
  children,
  ...options
}: DrawingToolbarProps) {
  const control = useDrawingControls(options);
  const mergedButtonStyle = buttonStyle ?? controlButtonStyle;

  if (typeof children === "function") {
    return children(control);
  }

  if (children) {
    return children;
  }

  return (
    <div
      className={className}
      style={style ?? controlGroupStyle}
      role="toolbar"
      aria-label="Drawing controls"
    >
      {DRAWING_KINDS.map(({ kind, label, icon }) => (
        <button
          key={kind}
          aria-label={label}
          aria-pressed={control.activeKind === kind}
          disabled={control.disabled}
          onClick={() => control.toggleKind(kind)}
          style={{
            ...mergedButtonStyle,
            backgroundColor:
              control.activeKind === kind ? "rgba(37, 99, 235, 0.14)" : mergedButtonStyle.backgroundColor,
            color: control.activeKind === kind ? "#1d4ed8" : mergedButtonStyle.color,
          }}
          type="button"
        >
          {icon}
        </button>
      ))}
      <button
        aria-label="Cancel drawing"
        disabled={control.disabled || !control.activeKind}
        onClick={control.cancel}
        style={mergedButtonStyle}
        type="button"
      >
        <CancelIcon />
      </button>
      <button
        aria-label="Undo drawing action"
        disabled={control.disabled || !control.canUndo}
        onClick={control.undo}
        style={mergedButtonStyle}
        type="button"
      >
        <UndoIcon />
      </button>
      <button
        aria-label="Redo drawing action"
        disabled={control.disabled || !control.canRedo}
        onClick={control.redo}
        style={mergedButtonStyle}
        type="button"
      >
        <RedoIcon />
      </button>
      <button
        aria-label="Clear drawings"
        disabled={control.disabled}
        onClick={control.clear}
        style={mergedButtonStyle}
        type="button"
      >
        <ClearIcon />
      </button>
    </div>
  );
}
