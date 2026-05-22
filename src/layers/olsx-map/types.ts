import type { Map as OlMap } from "ol";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";

export type OLSXMapProps = {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type OLSXMapRef = {
  getMap: () => OlMap | null;
  getLayerRegistry: () => Map<string, Layer>;
  getSourceRegistry: () => Map<string, VectorSource>;
  isMapReady: boolean;
};
