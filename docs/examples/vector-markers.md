<!--
@ai-purpose createVectorLayer와 Features를 사용한 typed vector marker 예제를 제공한다.
@ai-doc-kind example
@ai-keywords vector markers, createVectorLayer, featureTypes, featureType, OLSXVectorLayer.Features, Point, fromLonLat
@ai-related docs/api/vector-layer.md, docs/guides/events.md
-->

# 벡터 마커

`createVectorLayer`를 사용하여 타입 안전한 벡터 레이어를 생성하고, 지도 위에 마커를 표시하는 예제입니다.

---

## 예제: 장소 마커 표시

```tsx
import type { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { BaseLayer, createVectorLayer, OLSXMap } from "olsx";

const placeTypes = ["marker", "selected"] as const;

type Place = {
  id: string;
  name: string;
  lon: number;
  lat: number;
};

const PlaceLayer = createVectorLayer<typeof placeTypes, Place>();

function markerStyle(feature: FeatureLike, type?: (typeof placeTypes)[number]) {
  return new Style({
    image: new CircleStyle({
      radius: type === "selected" ? 10 : 7,
      fill: new Fill({ color: type === "selected" ? "#f97316" : "#2563eb" }),
      stroke: new Stroke({ color: "#ffffff", width: 3 }),
    }),
  });
}

export function PlacesMap({ places }: { places: Place[] }) {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={13} />
      <BaseLayer />

      <PlaceLayer id="places" featureTypes={placeTypes} style={markerStyle}>
        <PlaceLayer.Source />
        <PlaceLayer.Features
          id="place-markers"
          featureType="marker"
          data={places}
          getId={(place) => place.id}
          getGeometry={(place) => new Point(fromLonLat([place.lon, place.lat]))}
          onClick={(place) => {
            console.log(place.name);
          }}
        />
      </PlaceLayer>
    </OLSXMap>
  );
}
```

---

## 설명

### `createVectorLayer`로 타입 안전한 compound component 생성

`createVectorLayer<Types, Data>()`는 feature 타입과 데이터 타입을 제네릭으로 받아, `PlaceLayer`, `PlaceLayer.Source`, `PlaceLayer.Features` 등 타입이 연결된 compound component 세트를 반환합니다.

### `featureTypes`로 feature 종류 구분

`placeTypes`를 `as const`로 선언하면, `featureType` prop과 `style` 함수의 `type` 파라미터가 `"marker" | "selected"`로 좁혀집니다. 같은 레이어 안에서 feature를 역할별로 분류할 때 사용합니다.

### `style` 함수에서 feature 타입별 스타일 분기

`style` prop에 전달하는 함수는 `(feature, type?)` 시그니처를 가집니다. `type` 값에 따라 마커 크기·색상 등을 다르게 렌더링할 수 있습니다.

### `onClick`으로 feature 클릭 이벤트 처리

`PlaceLayer.Features`의 `onClick`에는 원본 데이터 타입(`Place`)이 그대로 전달됩니다. OpenLayers feature 객체가 아닌 도메인 데이터로 바로 작업할 수 있습니다.

---

## 관련 문서

- [VectorLayer API](../api/vector-layer.md)
- [이벤트 처리 가이드](../guides/events.md)
