/**
 * @ai-purpose Declarative component for manual polygon area drawing, measurement, and tooltips.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends mapRefsContext, vectorLayerContext, drawingCommandBus, manualDrawing, measurement, OLSXOverlay, useDrawingHistory
 * @ai-used-by OLSXVectorLayer compound component
 * @ai-keywords OLSXAreaDraw, area, draw, polygon, measurement, sketch
 */

import type { Feature } from "ol";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { OLSXOverlay } from "../../../olsx-overlay";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import { formatDrawingArea } from "../draw/internal/measurement";
import { useOLSXAreaDraw } from "../hooks/useOLSXAreaDraw";
import {
  DONE_TOOLTIP_STYLE,
  FLOATING_TOOLTIP_STYLE,
  deleteButtonStyle,
  getPrimaryValueStyle,
} from "./drawingPresetStyles";

export type OLSXAreaDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

function AreaDrawingSession({
  id,
  active,
  style,
  onComplete,
  onDelete,
}: Required<Pick<OLSXAreaDrawProps, "id" | "active">> &
  Pick<OLSXAreaDrawProps, "style" | "onComplete" | "onDelete">) {
  const {
    points,
    previewCoordinate,
    area,
    canShowArea,
    results,
    handleDelete,
  } = useOLSXAreaDraw({ id, active, style, onComplete, onDelete });

  return (
    <>
      <OLSXOverlay
        id={`${id}:drawing-tooltip`}
        coordinate={previewCoordinate}
        visible={active && points.length > 0 && Boolean(previewCoordinate)}
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
            <span>Area</span>
            <strong style={getPrimaryValueStyle("area")}>
              {canShowArea ? formatDrawingArea(area) : "-"}
            </strong>
          </div>
          <div style={{ color: "#d1d5db", marginTop: 6 }}>
            Right click to finish
          </div>
          <div style={{ color: "#d1d5db" }}>Esc cancels drawing</div>
          <div style={{ color: "#d1d5db" }}>Ctrl+Z removes the last point</div>
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
              <span>Area</span>
              <strong style={getPrimaryValueStyle("area")}>
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

export function OLSXAreaDraw({
  id = "area",
  active = true,
  style,
  onComplete,
  onDelete,
}: OLSXAreaDrawProps) {
  return (
    <AreaDrawingSession
      id={id}
      active={active}
      style={style}
      onComplete={onComplete}
      onDelete={onDelete}
    />
  );
}
