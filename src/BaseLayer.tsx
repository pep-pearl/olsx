import { OSM, XYZ } from "ol/source";
import { useMapContext } from "./context";
import TileLayer from "ol/layer/Tile";
import { useEffect } from "react";

type BaseLayerProps = {
  type?: "satellite" | "street";
};

export function BaseLayer({ type = "street" }: BaseLayerProps) {
  const { mapRef, baseLayerTypeRef } = useMapContext();

  useEffect(() => {
    if (!mapRef || !mapRef.current) return;

    const map = mapRef.current;

    const baseLayer = new TileLayer({
      source:
        type === "street"
          ? new OSM()
          : new XYZ({
              url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            }),
    });
    baseLayer.set("role", "base");
    baseLayer.setZIndex(-100);
    map.getLayers().insertAt(0, baseLayer);
    return () => {
      map.removeLayer(baseLayer);
    };
  }, [type, mapRef]);

  useEffect(() => {
    if (!baseLayerTypeRef) return;
    baseLayerTypeRef.current = type;
  }, [type, baseLayerTypeRef]);

  return null;
}
