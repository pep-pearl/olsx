import type { ReactNode } from "react";
import {
  useBaseLayerControl,
  type BaseLayerControl,
} from "../headless";
import { SatelliteIcon, StreetIcon } from "./icons";

export type BaseLayerToggleProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode | ((control: BaseLayerControl) => ReactNode);
};

export function BaseLayerToggle({
  className,
  style,
  children,
}: BaseLayerToggleProps) {
  const control = useBaseLayerControl();

  if (!control.isReady) return null;

  if (typeof children === "function") {
    return children(control);
  }

  if (children) {
    return children;
  }

  const combinedClassName = `olsx-control-button-standalone olsx-baselayer-toggle ${className ?? ""}`.trim();

  return (
    <button
      className={combinedClassName}
      aria-label="Toggle Base Layer"
      style={style}
      onClick={control.toggle}
      type="button"
    >
      {control.type === "street" ? <SatelliteIcon /> : <StreetIcon />}
    </button>
  );
}
