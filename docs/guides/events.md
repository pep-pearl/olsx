<!--
@ai-purpose OLSX feature click/hover event 처리 방식과 domain data 기반 workflow를 설명한다.
@ai-doc-kind guide
@ai-keywords events, onClick, onHover, feature event, listener registry, popup overlay, OLSXVectorLayer.Features
@ai-related docs/api/vector-layer.md, docs/examples/popup-overlay.md, docs/examples/vector-markers.md
-->

# 이벤트 처리

## 목표

feature click과 hover event를 처리하면서 React state는 raw OpenLayers feature가 아니라 domain data에 연결합니다.

## 언제 사용할까

feature를 선택하거나, 상세 정보를 열거나, popup을 띄워야 하면 `onClick`을 사용합니다.

pointer 이동에 따라 marker를 강조하거나 간단한 preview UI를 보여줘야 하면 `onHover`를 사용합니다.

OLSX가 노출하지 않는 OpenLayers event가 필요할 때만 ref를 통해 OpenLayers API를 직접 사용합니다.

## 예제

```tsx
import { useState } from "react";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { BaseLayer, OLSXMap, OLSXOverlay, OLSXVectorLayer } from "olsx";

type Place = { id: string; name: string; lon: number; lat: number };

const places: Place[] = [
  { id: "city-hall", name: "Seoul City Hall", lon: 126.9784, lat: 37.5666 },
];

export function ClickablePlaces() {
  const [selected, setSelected] = useState<Place | null>(null);

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
          getId={(place) => place.id}
          getGeometry={(place) => new Point(fromLonLat([place.lon, place.lat]))}
          onClick={(place) => setSelected(place)}
        />
      </OLSXVectorLayer>

      <OLSXOverlay
        coordinate={
          selected ? fromLonLat([selected.lon, selected.lat]) : null
        }
        positioning="bottom-center"
        offset={[0, -16]}
        stopEvent
      >
        <div style={{ background: "white", padding: 12 }}>{selected?.name}</div>
      </OLSXOverlay>
    </OLSXMap>
  );
}
```

## 설명

`Feature`와 `Features`의 event handler는 첫 번째 인자로 domain data item을, 두 번째 인자로 OpenLayers feature를 받습니다. 대부분의 application code는 domain data item을 React state와 business logic에 사용하는 편이 좋습니다.

OLSX는 map-level listener를 id 기반 listener registry에 등록합니다. component가 unmount될 때 산발적인 `map.on()` listener가 남지 않도록 cleanup path를 통일하기 위한 구조입니다.

## 절충점

- OLSX feature event는 click과 hover 중심의 일반적인 workflow를 다룹니다. 모든 OpenLayers browser event를 감싸지는 않습니다.
- `onHover`는 자주 호출될 수 있습니다. handler를 작게 유지하고 비싼 state update를 피하세요.
- click과 hover가 함께 등록되면 clickable feature의 cursor behavior도 함께 관리할 수 있습니다.

## 관련 문서

- [OLSXVectorLayer](../api/vector-layer.md)
- [팝업 오버레이 예제](../examples/popup-overlay.md)
- [벡터 마커 예제](../examples/vector-markers.md)
