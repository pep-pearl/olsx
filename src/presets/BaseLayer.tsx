import TileLayer from "ol/layer/Tile";
import type { XYZ } from "ol/source";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useBaseLayerContext, useMapContext } from "../core/context";
import { createBaseSource } from "../core/createBaseLayer";
import type { BaseLayerType } from "../core/types";

export type BaseLayerRef = {
  toggle: () => void;
};

type BaseLayerProps = {
  defaultType?: BaseLayerType;
};

/**
 * BaseLayer 컴포넌트는 맵의 기본 레이어를 관리하는 역할을 하는 컴포넌트입니다. 기본적으로 "street"과 "satellite" 두 가지 타입의 레이어를 지원하며, toggle 함수를 통해 이 두 레이어 사이를 전환할 수 있습니다. 내부적으로는 캐싱 메커니즘을 사용하여 이미 생성된 레이어를 재사용함으로써 성능을 최적화합니다. 또한, useEffect를 활용하여 컴포넌트의 라이프사이클에 맞춰 레이어를 추가/제거하는 로직을 구현하고 있습니다.
 */
export const BaseLayer = forwardRef<BaseLayerRef, BaseLayerProps>(
  (props, ref) => {
    const { defaultType = "street" } = props;
    const { mapRef } = useMapContext();
    const { baseLayerType, setBaseLayerType } = useBaseLayerContext();

    /**
     * base layer 타입에 따른 레이어 인스턴스를 캐싱하는 레퍼런스. Map 객체를 사용하여, 각 BaseLayerType에 해당하는 TileLayer 인스턴스를 저장. getOrCreateBaseLayer 함수에서 이 캐시를 참조하여, 이미 생성된 레이어가 있으면 재사용하고, 없으면 새로 생성해서 캐시에 저장하는 방식으로 동작
     */
    const cacheLayerRef = useRef<Map<BaseLayerType, TileLayer<XYZ>>>(new Map());

    /**
     * 주어진 타입의 base layer를 반환하는 함수. 캐싱 레이어에서 먼저 확인하고, 없으면 새로 생성해서 캐싱하는 방식으로 동작
     */
    const getOrCreateBaseLayer = useCallback((type: BaseLayerType) => {
      const cachedLayer = cacheLayerRef.current.get(type);

      if (cachedLayer) {
        return cachedLayer;
      }

      const baseLayer = new TileLayer({
        source: createBaseSource(type),
      });

      baseLayer.set("role", "base");
      baseLayer.setZIndex(-100);

      cacheLayerRef.current.set(type, baseLayer);

      return baseLayer;
    }, []);

    /**
     * 현재 활성화된 base layer 타입과, 실제로 맵에 추가된 레이어들을 비교해서, 필요한 경우 레이어를 추가/제거하는 함수. toggle 함수에서 호출되어, base layer 타입을 토글할 때마다 맵의 레이어 상태를 일치시킴
     */
    const changeBaseLayer = useCallback(
      (type: BaseLayerType) => {
        const map = mapRef?.current;
        if (!map) return;
        if (
          // type === baseLayerTypeRef.current &&
          type === baseLayerType &&
          cacheLayerRef.current.has(type)
        )
          return;

        const nextBaseLayer = getOrCreateBaseLayer(type);
        const layers = map.getLayers();
        const layerArray = layers.getArray();

        const isSameType = baseLayerType === type;
        const isAlreadyMounted = layerArray.includes(nextBaseLayer);

        if (isSameType && isAlreadyMounted) return;

        if (!isAlreadyMounted) {
          layers.insertAt(0, nextBaseLayer);
        }

        const layersToRemove = layers
          .getArray()
          .filter(
            (layer) => layer.get("role") === "base" && layer !== nextBaseLayer,
          );

        layersToRemove.forEach((layer) => {
          map.removeLayer(layer);
        });

        // baseLayerTypeRef.current = type;
        setBaseLayerType(type);
      },
      // [getOrCreateBaseLayer, mapRef],
      [getOrCreateBaseLayer, mapRef, baseLayerType, setBaseLayerType],
    );

    /**
     * 외부에서 호출할 수 있는 toggle 함수. 현재 활성화된 base layer 타입을 기준으로, 다음 타입을 결정해서 changeBaseLayer 함수를 호출. useImperativeHandle을 사용해서 ref로 노출
     */
    useImperativeHandle(
      ref,
      () => ({
        toggle: () => {
          // const currentType = baseLayerTypeRef.current ?? defaultType;
          const currentType = baseLayerType ?? defaultType;

          const nextType: BaseLayerType =
            currentType === "street" ? "satellite" : "street";

          changeBaseLayer(nextType);
        },
      }),
      [changeBaseLayer, defaultType, baseLayerType],
    );

    /**
     * 컴포넌트가 마운트될 때, defaultType에 해당하는 base layer를 맵에 추가. 컴포넌트가 언마운트될 때, 캐싱 레이어에 있는 모든 레이어를 맵에서 제거. useEffect의 의존성 배열에는 mapRef, changeBaseLayer, baseLayerTypeRef을 포함해서, 이 값들 중 하나라도 변경되면 effect가 재실행되도록 함
     */
    useEffect(() => {
      const cachedLayer = cacheLayerRef.current;
      // const baseLayerType = baseLayerTypeRef.current ?? "street";
      const map = mapRef?.current;

      if (!baseLayerType && !defaultType) return;
      changeBaseLayer(baseLayerType ?? defaultType);

      return () => {
        if (!map) return;

        cachedLayer.forEach((layer) => {
          if (map.getLayers().getArray().includes(layer)) {
            map.removeLayer(layer);
          }
        });

        cachedLayer?.clear();
      };
    }, [mapRef, changeBaseLayer, baseLayerType, setBaseLayerType, defaultType]);

    return null;
  },
);
