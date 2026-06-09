/**
 * @ai-purpose Declarative component for manual circle radius drawing, measurement, and tooltips.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends mapRefsContext, vectorLayerContext, drawingCommandBus, manualDrawing, measurement, OLSXOverlay, useDrawingHistory
 * @ai-used-by OLSXVectorLayer compound component
 * @ai-keywords OLSXCircleDraw, circle, draw, radius, measurement, sketch
 */

import type { Feature } from "ol";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { OLSXOverlay } from "../../../olsx-overlay";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import { formatDrawingMeters } from "../draw/internal/measurement";
import { useOLSXCircleDraw } from "../hooks/useOLSXCircleDraw";
import {
  DONE_TOOLTIP_STYLE,
  FLOATING_TOOLTIP_STYLE,
  deleteButtonStyle,
  getPrimaryValueStyle,
} from "./drawingPresetStyles";

export type OLSXCircleDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

function CircleDrawingSession({
  id,
  active,
  style,
  onComplete,
  onDelete,
}: Required<Pick<OLSXCircleDrawProps, "id" | "active">> &
  Pick<OLSXCircleDrawProps, "style" | "onComplete" | "onDelete">) {
  const {
    center,
    edge,
    radius,
    results,
    handleDelete,
  } = useOLSXCircleDraw({ id, active, style, onComplete, onDelete });

  return (
    <>
      <OLSXOverlay
        id={`${id}:drawing-tooltip`}
        coordinate={edge}
        visible={active && Boolean(center) && Boolean(edge)}
        positioning="bottom-center"
        offset={[0, -16]}
        stopEvent={false}
        insertFirst={false}
      >
        <div style={FLOATING_TOOLTIP_STYLE}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <span>Radius</span>
            <strong style={getPrimaryValueStyle("circle")}>
              {radius > 0 ? formatDrawingMeters(radius) : "-"}
            </strong>
          </div>
          <div style={{ color: "#d1d5db", marginTop: 6 }}>
            Click to add another radius
          </div>
          <div style={{ color: "#d1d5db" }}>Right click to finish center</div>
          <div style={{ color: "#d1d5db" }}>Esc cancels drawing</div>
        </div>
      </OLSXOverlay>
      {results.map((result) => (
        <OLSXOverlay
          key={result.id}
          id={result.id}
          coordinate={result.coordinate}
          positioning="bottom-center"
          offset={[0, -12]}
          stopEvent
          insertFirst={false}
        >
          <div style={DONE_TOOLTIP_STYLE}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <span>Radius</span>
              <strong style={getPrimaryValueStyle("circle")}>
                {result.label}
              </strong>
            </div>
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleDelete(result);
              }}
              style={deleteButtonStyle}
            >
              Delete
            </button>
          </div>
        </OLSXOverlay>
      ))}
    </>
  );
}

export function OLSXCircleDraw({
  id = "circle",
  active = true,
  style,
  onComplete,
  onDelete,
}: OLSXCircleDrawProps) {
  return (
    <CircleDrawingSession
      id={id}
      active={active}
      style={style}
      onComplete={onComplete}
      onDelete={onDelete}
    />
  );
}
