import type TileLayer from "ol/layer/Tile";
import type { XYZ } from "ol/source";

export type OLSXTileLayerRef = {
  isTileLayerReady: boolean;
  getTileLayer: () => TileLayer | null;
};

export type OLSXTileLayerProps = {
  id: string;
  source?: XYZ;
};
