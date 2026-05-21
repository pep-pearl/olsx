import TileLayer from "ol/layer/Tile";
import { useMapContext } from "./context";
import { createBaseSource } from "./createBaseLayer";
import type { BaseLayerType } from "./types";

export function useToggleBaseLayerType(
  setType?: React.Dispatch<React.SetStateAction<BaseLayerType>>,
) {
  const { baseLayerTypeRef, mapRef } = useMapContext();

  return function () {
    if (!baseLayerTypeRef || !mapRef) return;

    const currentType = baseLayerTypeRef.current ?? "street";
    const nextType: BaseLayerType =
      currentType === "street" ? "satellite" : "street";

    baseLayerTypeRef.current = nextType;

    // state 기반으로 쓰는 경우
    if (setType) {
      setType(nextType);
      return;
    }

    // state가 없는 경우: ref 기반 + OpenLayers 레이어 직접 변경
    const map = mapRef?.current;
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
