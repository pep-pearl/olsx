import type { ReactNode } from "react";
import { useZoomControl, type ZoomControlApi } from "../headless";
import { ZoomInIcon, ZoomOutIcon } from "./icons";

export type ZoomControlProps = {
  className?: string;
  style?: React.CSSProperties;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  children?: ReactNode | ((control: ZoomControlApi) => ReactNode);
};

export function ZoomControl({
  className,
  style,
  buttonClassName,
  buttonStyle,
  children,
}: ZoomControlProps) {
  const control = useZoomControl();

  if (!control.isReady) return null;

  if (typeof children === "function") {
    return children(control);
  }

  if (children) {
    return children;
  }

  return (
    <div
      className={`olsx-control-group olsx-zoom-control ${className ?? ""}`.trim()}
      style={style}
    >
      <button
        className={`olsx-control-button olsx-zoom-in ${buttonClassName ?? ""}`.trim()}
        style={buttonStyle}
        type="button"
        onClick={() => control.zoomIn()}
        aria-label="Zoom In"
      >
        <ZoomInIcon />
      </button>
      <button
        className={`olsx-control-button olsx-zoom-out ${buttonClassName ?? ""}`.trim()}
        style={buttonStyle}
        type="button"
        onClick={() => control.zoomOut()}
        aria-label="Zoom Out"
      >
        <ZoomOutIcon />
      </button>
    </div>
  );
}
