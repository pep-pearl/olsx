import type { Coordinate } from "ol/coordinate";
import type { PanIntoViewOptions } from "ol/Overlay";

type OverlayPositionLike = {
  setPosition: (coordinate: Coordinate | undefined) => void;
  panIntoView: (options?: PanIntoViewOptions) => void;
};

export type SyncOverlayPositionOptions = {
  overlay: OverlayPositionLike;
  coordinate: Coordinate | null | undefined;
  visible: boolean;
  autoPan: boolean | PanIntoViewOptions;
};

export function syncOverlayPosition({
  overlay,
  coordinate,
  visible,
  autoPan,
}: SyncOverlayPositionOptions) {
  if (!visible || !coordinate) {
    overlay.setPosition(undefined);
    return;
  }

  overlay.setPosition(coordinate);

  if (autoPan) {
    overlay.panIntoView(autoPan === true ? undefined : autoPan);
  }
}
