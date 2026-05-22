import TileLayer from "ol/layer/Tile";
import type { BaseLayerType } from "../types";
import { createBaseSource } from "../utils/createBaseLayer";
import { useBaseLayerContext, useMapRefsContext } from "./context";

export function useToggleBaseLayerType(
  setType?: React.Dispatch<React.SetStateAction<BaseLayerType>>,
) {
  const { mapRef } = useMapRefsContext();
  const { baseLayerType, setBaseLayerType } = useBaseLayerContext();

  return function () {
    const currentType = baseLayerType ?? "street";
    const nextType: BaseLayerType =
      currentType === "street" ? "satellite" : "street";

    if (setType) {
      setType(nextType);
      return;
    }

    setBaseLayerType(nextType);

    const map = mapRef.current;
    if (!map) return;

    const baseLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get("role") === "base");

    if (baseLayer instanceof TileLayer) {
      const source = createBaseSource(nextType);
      baseLayer.setSource(source);
    }
  };
}
