import type { ReactNode } from "react";
import {
  Controls,
  useBaseLayerControl,
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
    <ZoomControl />
    <BaseLayerToggle />
    <ZoomButton />
    <ToggleBaseLayerButton />
  </Controls>
);

function useHeadlessControlsTypeCheck(children?: ReactNode) {
  const zoom = useZoomControl();
  const baseLayer = useBaseLayerControl();

  zoom.zoomIn();
  zoom.zoomOut();
  zoom.setZoom(12);
  baseLayer.toggle();

  return (
    <div data-zoom={zoom.zoom} data-base-layer={baseLayer.type}>
      {children}
    </div>
  );
}

void defaultControlsElement;
void useHeadlessControlsTypeCheck;
