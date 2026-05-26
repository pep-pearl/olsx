import {
  useBaseLayerContext,
  useMapReadyContext,
} from "../../core/model/context";
import type { BaseLayerType } from "../../core/types";

export type BaseLayerControl = {
  type: BaseLayerType | null;
  nextType: BaseLayerType | null;
  isReady: boolean;
  toggle: () => void;
  setType: (type: BaseLayerType) => void;
};

function getNextBaseLayerType(type: BaseLayerType | null): BaseLayerType | null {
  if (!type) return null;
  return type === "street" ? "satellite" : "street";
}

export function useBaseLayerControl(): BaseLayerControl {
  const { isMapReady } = useMapReadyContext();
  const { baseLayerType, setBaseLayerType } = useBaseLayerContext();
  const nextType = getNextBaseLayerType(baseLayerType);

  function toggle() {
    if (!nextType) return;
    setBaseLayerType(nextType);
  }

  return {
    type: baseLayerType,
    nextType,
    isReady: isMapReady && Boolean(baseLayerType),
    toggle,
    setType: setBaseLayerType,
  };
}
