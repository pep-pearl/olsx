import type { ReactNode } from "react";
import {
  Controls,
  DrawingToolbar,
  useBaseLayerControl,
  useDrawingControls,
  useZoomControl,
  ZoomControl,
  BaseLayerToggle,
  ZoomButton,
  ToggleBaseLayerButton,
} from "./index";

const defaultControlsElement = (
  <Controls>
    <Controls.Zoom />
    <Controls.BaseLayerToggle />
    <Controls.DrawingToolbar activeKind="distance" onActiveKindChange={() => undefined} />
    <ZoomControl />
    <BaseLayerToggle />
    <DrawingToolbar activeKind="area" onActiveKindChange={() => undefined} />
    <ZoomButton />
    <ToggleBaseLayerButton />
  </Controls>
);

function useHeadlessControlsTypeCheck(children?: ReactNode) {
  const zoom = useZoomControl();
  const baseLayer = useBaseLayerControl();
  const drawing = useDrawingControls();

  zoom.zoomIn();
  zoom.zoomOut();
  zoom.setZoom(12);
  baseLayer.toggle();
  drawing.setActiveKind("circle");
  drawing.cancel();
  drawing.undo();
  drawing.redo();
  drawing.clear();

  return (
    <div
      data-zoom={zoom.zoom}
      data-base-layer={baseLayer.type}
      data-drawing-kind={drawing.activeKind}
    >
      {children}
    </div>
  );
}

void defaultControlsElement;
void useHeadlessControlsTypeCheck;
