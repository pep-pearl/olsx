import type { Coordinate } from "ol/coordinate";
import type OlOverlay from "ol/Overlay";
import type { Positioning } from "ol/Overlay";

type AutoPanOptions = Parameters<OlOverlay["panIntoView"]>[0];

export type OLSXOverlayRef = {
  getOverlay: () => OlOverlay | null;
  setPosition: (coordinate: Coordinate | null | undefined) => void;
  panIntoView: (options?: AutoPanOptions) => void;
  hide: () => void;
};

export type OLSXOverlayProps = {
  id?: string | number;
  coordinate?: Coordinate | null;
  visible?: boolean;
  positioning?: Positioning;
  offset?: [number, number];
  autoPan?: boolean | AutoPanOptions;
  stopEvent?: boolean;
  insertFirst?: boolean;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  children?: React.ReactNode;
  element?: HTMLElement | null;
};
