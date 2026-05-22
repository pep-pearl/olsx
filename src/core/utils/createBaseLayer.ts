import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import type { BaseLayerType } from "../types";

export function createBaseSource(type: BaseLayerType) {
  return type === "street"
    ? new OSM()
    : new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      });
}
