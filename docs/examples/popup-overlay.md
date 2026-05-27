<!--
@ai-purpose feature click과 OLSXOverlay를 조합한 popup overlay 예제를 제공한다.
@ai-doc-kind example
@ai-keywords popup overlay, OLSXOverlay, onClick, selected feature, Coordinate, OLSXOverlayRef
@ai-related docs/api/overlay.md, docs/api/vector-layer.md, docs/guides/events.md
-->

# 팝업 오버레이

Feature를 클릭하면 해당 위치에 팝업을 표시하는 예제입니다. `OLSXOverlay`를 사용하여 React 컴포넌트를 지도 좌표 위에 고정합니다.

---

## 예제: 장소 클릭 팝업

```tsx
import { useState, useRef } from "react";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import type { Coordinate } from "ol/coordinate";
import {
  BaseLayer,
  OLSXMap,
  OLSXOverlay,
  OLSXVectorLayer,
  type OLSXOverlayRef,
} from "olsx";

type Place = { id: string; name: string; lon: number; lat: number };

const places: Place[] = [
  { id: "city-hall", name: "서울시청", lon: 126.9784, lat: 37.5666 },
  { id: "gwanghwamun", name: "광화문", lon: 126.9769, lat: 37.5759 },
];

export function PopupMap() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const overlayRef = useRef<OLSXOverlayRef>(null);

  function handleClick(place: Place) {
    setSelected(place);
    setCoordinate(fromLonLat([place.lon, place.lat]));
  }

  function handleClose() {
    overlayRef.current?.hide();
    setSelected(null);
  }

  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />
      <BaseLayer />

      <OLSXVectorLayer id="places">
        <OLSXVectorLayer.Source />
        <OLSXVectorLayer.Features
          id="place-markers"
          featureType="marker"
          data={places}
          getId={(p) => p.id}
          getGeometry={(p) => new Point(fromLonLat([p.lon, p.lat]))}
          onClick={handleClick}
        />
      </OLSXVectorLayer>

      <OLSXOverlay
        ref={overlayRef}
        id="popup"
        coordinate={coordinate}
        positioning="bottom-center"
        offset={[0, -16]}
        autoPan
        stopEvent
      >
        <div style={{ background: "white", padding: 12, borderRadius: 8 }}>
          <p>{selected?.name}</p>
          <button type="button" onClick={handleClose}>
            닫기
          </button>
        </div>
      </OLSXOverlay>
    </OLSXMap>
  );
}
```

---

## 설명

### Feature 클릭 → state 업데이트

`OLSXVectorLayer.Features`의 `onClick` 핸들러에서 클릭된 장소 데이터와 좌표를 React state에 저장합니다.

### `OLSXOverlay`로 팝업 표시

- **`coordinate`** — 팝업이 고정될 지도 좌표입니다. `null`이면 팝업이 표시되지 않습니다.
- **`positioning`** — 오버레이 앵커 위치입니다. `"bottom-center"`는 팝업 하단 중앙이 좌표에 맞춰집니다.
- **`offset`** — 앵커로부터의 픽셀 오프셋입니다. 마커와 겹치지 않도록 조정합니다.
- **`autoPan`** — 팝업이 지도 밖에 있으면 자동으로 패닝합니다.
- **`stopEvent`** — 팝업 내부의 클릭·스크롤 이벤트가 지도로 전파되지 않습니다.

### ref로 팝업 닫기

`OLSXOverlayRef`의 `hide()` 메서드를 호출하면 오버레이를 숨깁니다. 닫기 버튼이나 지도 클릭 시 활용합니다.

---

## 관련 문서

- [OLSXOverlay API](../api/overlay.md)
- [VectorLayer API](../api/vector-layer.md)
- [이벤트 처리 가이드](../guides/events.md)
