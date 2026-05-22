import { useBaseLayerContext } from "../model/context";
import type { BaseLayerType } from "../types";

export function useToggleBaseLayer() {
  const { baseLayerType, setBaseLayerType } = useBaseLayerContext();
  function toggle() {
    if (!baseLayerType) return;
    const currentType = baseLayerType;
    const nextType: BaseLayerType =
      currentType === "street" ? "satellite" : "street";

    setBaseLayerType(nextType);
  }

  return { toggle };
}
