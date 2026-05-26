import type { Collection, Map as OlMap, View } from "ol";
import type { Control } from "ol/control";
import type { Layer } from "ol/layer";
import type VectorSource from "ol/source/Vector";

export type OLSXMapProps = {
  defaultControl?: Control[] | Collection<Control>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type OLSXMapRef = {
  getMap: () => OlMap | null;
  getView: () => View | null;
  getLayerRegistry: () => Map<string, Layer>;
  getSourceRegistry: () => Map<string, VectorSource>;
  isMapReady: boolean;
};

export type OLSXViewProps = {
  defaultCenter: [number, number];
  defaultZoom: number;
};

export type OLSXViewRef = {
  getView: () => View | null;
};
