import { View } from "ol";
import type { Layer } from "ol/layer";
import OlMap from "ol/Map";
import { fromLonLat } from "ol/proj";
import type VectorSource from "ol/source/Vector";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BaseLayerContext, MapContext } from "../core/context";
import type { BaseLayerType } from "../core/types";

type OLSXMapRef = {
  map: OlMap | null;
  layerRegistry: Map<string, Layer>;
  sourceRegistry: Map<string, VectorSource>;
};

type MapProps = {
  defaultCenter?: [number, number];
  defaultZoom?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];
const DEFAULT_ZOOM = 16;

export const OLSXMap = forwardRef<OLSXMapRef, MapProps>(
  (
    {
      style,
      defaultCenter = DEFAULT_CENTER,
      defaultZoom = DEFAULT_ZOOM,
      children,
    },
    ref,
  ) => {
    const [isMapReady, setIsMapReady] = useState(false);

    const mapRef = useRef<OlMap>(null);
    const mapElementRef = useRef<HTMLDivElement>(null);

    const layerRegistryRef = useRef<Map<string, Layer>>(new Map());
    const sourceRegistryRef = useRef<Map<string, VectorSource>>(new Map());

    // 현재 활성화된 base layer 타입을 저장하는 state. 초기값은 null로 설정하여, 실제로 어떤 레이어도 활성화되지 않은 상태를 나타냄. BaseLayer 컴포넌트에서 toggle 함수를 통해 이 값을 업데이트하면서, 현재 어떤 base layer가 활성화되어 있는지를 관리함
    const [baseLayerType, setBaseLayerType] = useState<BaseLayerType | null>(
      null,
    );

    useEffect(() => {
      if (!mapElementRef.current) return;

      const map = new OlMap({
        target: mapElementRef.current,
      });
      const view = new View({
        center: fromLonLat(defaultCenter),
        zoom: defaultZoom,
      });
      mapRef.current = map;
      map.setView(view);
      setIsMapReady(true);
      return () => {
        mapRef.current = null;
        mapElementRef.current = null;
        map.dispose();
        setIsMapReady(false);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      map: mapRef.current,
      layerRegistry: layerRegistryRef.current,
      sourceRegistry: sourceRegistryRef.current,
    }));

    return (
      <MapContext.Provider
        value={{
          mapRef,
          layerRegistryRef,
          sourceRegistryRef,
        }}
      >
        <BaseLayerContext.Provider
          value={{
            baseLayerType,
            setBaseLayerType,
          }}
        >
          <div style={{ position: "relative", ...style }}>
            <div
              ref={mapElementRef}
              style={{ width: "100%", height: "100%" }}
            />
            {isMapReady && children}
          </div>
        </BaseLayerContext.Provider>
      </MapContext.Provider>
    );
  },
);
