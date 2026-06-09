/**
 * @ai-purpose Declarative component for manual linestring distance drawing, measurement, and tooltips.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends mapRefsContext, vectorLayerContext, drawingCommandBus, manualDrawing, measurement, OLSXOverlay, useDrawingHistory
 * @ai-used-by OLSXVectorLayer compound component
 * @ai-keywords OLSXDistanceDraw, distance, draw, linestring, measurement, sketch
 */

import type { Feature } from "ol";
import LineString from "ol/geom/LineString";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import { Fragment } from "react";
import { OLSXOverlay } from "../../../olsx-overlay";
import type { DrawingResult } from "../draw/internal/drawingHistory";
import {
  formatDrawingLength,
  getLineSegmentMeasurements,
} from "../draw/internal/measurement";
import { useOLSXDistanceDraw } from "../hooks/useOLSXDistanceDraw";
import {
  DONE_TOOLTIP_STYLE,
  DRAWING_PRESET_COLORS,
  FLOATING_TOOLTIP_STYLE,
  SEGMENT_LABEL_STYLE,
  deleteButtonStyle,
  getPrimaryValueStyle,
} from "./drawingPresetStyles";

export type OLSXDistanceDrawProps = {
  id?: string;
  active?: boolean;
  style?: StyleLike | FlatStyleLike;
  onComplete?: (result: DrawingResult<Feature>) => void;
  onDelete?: (result: DrawingResult<Feature>) => void;
};

function getFeatureLineString(feature: Feature) {
  const geometry = feature.getGeometry();
  return geometry instanceof LineString ? geometry : null;
}

export function OLSXDistanceDraw({
  id = "distance",
  active = true,
  style,
  onComplete,
  onDelete,
}: OLSXDistanceDrawProps) {
  const {
    previewCoordinate,
    drawingTotal,
    drawingSegments,
    isDrawing,
    results,
    handleDelete,
  } = useOLSXDistanceDraw({ id, active, style, onComplete, onDelete });

  return (
    <>
      <OLSXOverlay
        id={`${id}:drawing-tooltip`}
        coordinate={previewCoordinate}
        visible={active && isDrawing && Boolean(previewCoordinate)}
        positioning="bottom-center"
        offset={[0, -16]}
        stopEvent={false}
        insertFirst={false}
      >
        <div style={FLOATING_TOOLTIP_STYLE}>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "space-between",
            }}
          >
            <span>Total</span>
            <strong style={getPrimaryValueStyle("distance")}>
              {formatDrawingLength(drawingTotal)}
            </strong>
          </div>
          <div style={{ color: "#d1d5db", marginTop: 6 }}>
            Right click to finish
          </div>
          <div style={{ color: "#d1d5db" }}>Esc cancels drawing</div>
          <div style={{ color: "#d1d5db" }}>Ctrl+Z removes the last point</div>
        </div>
      </OLSXOverlay>
      {active &&
        isDrawing &&
        drawingSegments.map((segment) => (
          <OLSXOverlay
            key={`drawing-segment-${segment.index}`}
            id={`${id}:drawing-segment:${segment.index}`}
            coordinate={segment.coordinate}
            positioning="top-center"
            offset={[0, 10]}
            stopEvent={false}
            insertFirst={false}
          >
            <div
              style={{
                ...SEGMENT_LABEL_STYLE,
                color: DRAWING_PRESET_COLORS.distance.main,
              }}
            >
              {segment.label}
            </div>
          </OLSXOverlay>
        ))}
      {results.map((result) => {
        const resultLine = getFeatureLineString(result.feature);
        const resultSegments = resultLine
          ? getLineSegmentMeasurements(resultLine.getCoordinates())
          : [];

        return (
          <Fragment key={result.id}>
            {resultSegments.map((segment) => (
              <OLSXOverlay
                key={`${result.id}:segment:${segment.index}`}
                id={`${result.id}:segment:${segment.index}`}
                coordinate={segment.coordinate}
                positioning="top-center"
                offset={[0, 10]}
                stopEvent={false}
                insertFirst={false}
              >
                <div
                  style={{
                    ...SEGMENT_LABEL_STYLE,
                    color: DRAWING_PRESET_COLORS.distance.main,
                  }}
                >
                  {segment.label}
                </div>
              </OLSXOverlay>
            ))}
            <OLSXOverlay
              key={`${result.id}:done`}
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
                    gap: 20,
                    justifyContent: "space-between",
                  }}
                >
                  <span>Total</span>
                  <strong style={getPrimaryValueStyle("distance")}>
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
          </Fragment>
        );
      })}
    </>
  );
}
