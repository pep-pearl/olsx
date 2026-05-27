<!--
@ai-purpose OLSX map, vector feature, style, overlay 사용 시 성능에 영향을 주는 패턴을 설명한다.
@ai-doc-kind guide
@ai-keywords performance, feature diff, getId, getGeometry, cacheStyle, useMapReadyContext, onHover, vector markers
@ai-related docs/api/vector-layer.md, docs/api/hooks.md, docs/examples/vector-markers.md
-->

# 성능 최적화

## 목표

layer, feature, style, overlay가 계속 바뀌는 지도에서도 OLSX map을 부드럽게 유지합니다.

## 언제 사용할까

data 기반 feature를 렌더링하거나, marker data가 자주 바뀌거나, 큰 vector layer에 style을 적용하거나, event가 많은 custom UI를 붙일 때 참고합니다.

## 예제

```tsx
import { useCallback } from "react";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { BaseLayer, OLSXMap, OLSXVectorLayer } from "olsx";

type Place = { id: string; lon: number; lat: number };

export function StableMarkers({ places }: { places: Place[] }) {
  const getId = useCallback((place: Place) => place.id, []);
  const getGeometry = useCallback(
    (place: Place) => new Point(fromLonLat([place.lon, place.lat])),
    [],
  );

  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />
      <BaseLayer />

      <OLSXVectorLayer id="places" featureTypes={["marker"] as const}>
        <OLSXVectorLayer.Source />
        <OLSXVectorLayer.Features
          id="place-markers"
          featureType="marker"
          data={places}
          getId={getId}
          getGeometry={getGeometry}
        />
      </OLSXVectorLayer>
    </OLSXMap>
  );
}
```

## 설명

`Features`는 id 기반 diff를 사용합니다. data가 바뀔 때 전체 feature를 매번 제거하고 다시 만들지 않습니다. 안정적인 id를 제공하면 변경된 OpenLayers feature만 갱신할 수 있습니다.

`OLSXVectorLayer`의 style cache는 기본으로 켜져 있습니다. feature와 feature type 기준으로 style 결과가 안정적이면 유용합니다. 외부 React state처럼 feature에 들어 있지 않은 값으로 style이 바뀐다면 `cacheStyle={false}`를 사용하세요.

## 권장 패턴

- `getId`는 안정적으로 유지하고, 같은 domain object에는 같은 id를 반환하세요.
- parent render가 잦다면 비싼 `getGeometry`, style, click, hover callback을 memoize하세요.
- 배열 data에는 `Features`, 소수의 명시적 feature에는 `Feature`를 사용하세요.
- map readiness만 필요하면 `useMapContext()`보다 `useMapReadyContext()`를 사용하세요.
- `onHover` 안에서 비싼 React state update를 피하세요.
- pointer나 drawing을 따라가는 overlay는 가볍게 유지하세요.

## 절충점

- in-place feature update는 OpenLayers feature identity를 유지하므로 event와 style 안정성에 유리합니다.
- id를 의도적으로 바꾸면 cleanup 후 재생성됩니다. hard reset에는 유용하지만 일반 update에는 비용이 큽니다.
- style cache는 안정적인 layer에 유리하지만, 외부 상태 기반 style 변경을 숨길 수 있습니다.

## 관련 문서

- [OLSXVectorLayer](../api/vector-layer.md)
- [Hooks](../api/hooks.md)
- [벡터 마커 예제](../examples/vector-markers.md)
