import type { Coordinate } from "ol/coordinate";
import type { Positioning } from "ol/Overlay";
import { forwardRef, useImperativeHandle } from "react";
import { OLSXOverlay } from "../../../olsx-overlay";
import { useDrawControl } from "../headless/useDrawControl";

export type OLSXDrawTooltipProps = {
  id?: string | number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  offset?: [number, number];
  positioning?: Positioning;
  zIndex?: number;
};

export type OLSXDrawTooltipRef = {
  getCoordinate: () => Coordinate | null;
  isDrawing: boolean;
};

const DEFAULT_TOOLTIP_STYLE: React.CSSProperties = {
  background: "rgba(17, 24, 39, 0.88)",
  borderRadius: 4,
  color: "#ffffff",
  fontSize: 12,
  lineHeight: 1.4,
  padding: "6px 8px",
  pointerEvents: "none",
  whiteSpace: "nowrap",
};

function OLSXDrawTooltipComp(
  {
    id,
    children = "Click to continue drawing",
    className,
    style,
    offset = [12, 12],
    positioning = "top-left",
    zIndex,
  }: OLSXDrawTooltipProps,
  ref: React.ForwardedRef<OLSXDrawTooltipRef>,
) {
  const { coordinate, isDrawing } = useDrawControl();

  useImperativeHandle(
    ref,
    () => ({
      getCoordinate: () => coordinate,
      isDrawing,
    }),
    [coordinate, isDrawing],
  );

  return (
    <OLSXOverlay
      id={id}
      coordinate={coordinate}
      visible={isDrawing && Boolean(coordinate)}
      positioning={positioning}
      offset={offset}
      stopEvent={false}
      insertFirst={false}
      className={className}
      style={{
        ...DEFAULT_TOOLTIP_STYLE,
        ...style,
      }}
      zIndex={zIndex}
    >
      {children}
    </OLSXOverlay>
  );
}

export const OLSXDrawTooltip = forwardRef(OLSXDrawTooltipComp);
