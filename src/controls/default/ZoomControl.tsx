import type { ReactNode } from "react";
import { useZoomControl, type ZoomControlApi } from "../headless";
import { ZoomInIcon, ZoomOutIcon } from "./icons";
import { controlButtonStyle, controlGroupStyle } from "./styles";

export type ZoomControlProps = {
  children?: ReactNode | ((control: ZoomControlApi) => ReactNode);
};

export function ZoomControl({ children }: ZoomControlProps) {
  const control = useZoomControl();

  if (!control.isReady) return null;

  if (typeof children === "function") {
    return children(control);
  }

  if (children) {
    return children;
  }

  return (
    <div style={controlGroupStyle}>
      <button
        style={controlButtonStyle}
        type="button"
        onClick={() => control.zoomIn()}
        aria-label="Zoom In"
      >
        <ZoomInIcon />
      </button>
      <button
        style={{ ...controlButtonStyle, borderTop: "1px solid #e5e7eb" }}
        type="button"
        onClick={() => control.zoomOut()}
        aria-label="Zoom Out"
      >
        <ZoomOutIcon />
      </button>
    </div>
  );
}
