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
  type DrawingControlKind,
  type DrawingControls,
  type DrawingControlsOptions,
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

type DrawingKind = {
  kind: DrawingControlKind;
  label: string;
  icon: ReactNode;
};

export type DrawingToolbarProps = DrawingControlsOptions & {
  className?: string;
  style?: CSSProperties;
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  children?: ReactNode | ((control: DrawingControls) => ReactNode);
  kinds?: Array<DrawingKind>;
};

const DRAWING_KINDS: Array<DrawingKind> = [
  { kind: "distance", label: "Draw distance", icon: <DistanceIcon /> },
  { kind: "area", label: "Draw area", icon: <AreaIcon /> },
  { kind: "circle", label: "Draw radius", icon: <CircleIcon /> },
];

export function DrawingToolbar({
  className,
  style,
  buttonClassName,
  buttonStyle,
  children,
  kinds = DRAWING_KINDS,
  ...options
}: DrawingToolbarProps) {
  const control = useDrawingControls(options);

  if (typeof children === "function") {
    return children(control);
  }

  if (children) {
    return children;
  }

  const combinedClassName = `olsx-control-group olsx-drawing-toolbar ${className ?? ""}`.trim();
  const baseButtonClass = `olsx-control-button ${buttonClassName ?? ""}`.trim();

  return (
    <div
      className={combinedClassName}
      style={style}
      role="toolbar"
      aria-label="Drawing controls"
    >
      {kinds.map(({ kind, label, icon }) => {
        const isActive = control.activeKind === kind;
        return (
          <button
            key={kind}
            aria-label={label}
            aria-pressed={isActive}
            disabled={control.disabled}
            onClick={() => control.toggleKind(kind)}
            className={`${baseButtonClass} ${isActive ? "olsx-active" : ""}`.trim()}
            style={buttonStyle}
            type="button"
          >
            {icon}
          </button>
        );
      })}
      <button
        aria-label="Cancel drawing"
        disabled={control.disabled || !control.activeKind}
        onClick={control.cancel}
        className={baseButtonClass}
        style={buttonStyle}
        type="button"
      >
        <CancelIcon />
      </button>
      <button
        aria-label="Undo drawing action"
        disabled={control.disabled || !control.canUndo}
        onClick={control.undo}
        className={baseButtonClass}
        style={buttonStyle}
        type="button"
      >
        <UndoIcon />
      </button>
      <button
        aria-label="Redo drawing action"
        disabled={control.disabled || !control.canRedo}
        onClick={control.redo}
        className={baseButtonClass}
        style={buttonStyle}
        type="button"
      >
        <RedoIcon />
      </button>
      <button
        aria-label="Clear drawings"
        disabled={control.disabled}
        onClick={control.clear}
        className={baseButtonClass}
        style={buttonStyle}
        type="button"
      >
        <ClearIcon />
      </button>
    </div>
  );
}
