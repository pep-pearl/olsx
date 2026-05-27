<!--
@ai-purpose BaseLayer preset 외의 custom tile/vector layer 구성 방법을 설명한다.
@ai-doc-kind guide
@ai-keywords custom layer, OLSXTileLayer, BaseLayer, XYZ source, vector layer, useMapRefsContext
@ai-related docs/api/map.md, docs/api/vector-layer.md, docs/guides/performance.md
-->

# 커스텀 레이어

## 목표

기본 `BaseLayer` preset으로 충분하지 않을 때, OLSX lifecycle 안에서 custom layer를 추가합니다.

## 언제 사용할까

OpenLayers `XYZ` tile source가 이미 있다면 `OLSXTileLayer`를 사용합니다.

feature, data 기반 marker, drawing interaction, 측정 결과를 다룬다면 `OLSXVectorLayer`를 사용합니다.

아직 OLSX wrapper가 없는 layer type이 필요할 때만 `useMapRefsContext()`로 OpenLayers API에 직접 접근합니다.

## 예제

```tsx
import XYZ from "ol/source/XYZ";
import { BaseLayer, OLSXMap, OLSXTileLayer } from "olsx";

const weatherTiles = new XYZ({
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
});

export function CustomTileLayerMap() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={10} />
      <BaseLayer />
      <OLSXTileLayer id="weather-overlay" source={weatherTiles} />
    </OLSXMap>
  );
}
```

## 설명

`OLSXTileLayer`는 `BaseLayer`보다 낮은 수준의 wrapper입니다. 사용자가 제공한 source로 tile layer를 mount하고 `id`로 registry에 등록합니다. base-layer toggle state에는 참여하지 않습니다.

vector data에는 `OLSXVectorLayer`를 우선 사용하세요. vector source context, feature registry, event, drawing support가 함께 제공됩니다.

## 절충점

- `BaseLayer`는 편하지만 street/satellite 전환에 맞춘 preset입니다.
- `OLSXTileLayer`는 source 제어권이 크지만 source 생성과 설정은 사용자가 담당합니다.
- OpenLayers layer를 직접 관리하면 제어권은 가장 크지만 cleanup과 registry 일관성도 직접 책임져야 합니다.

## 관련 문서

- [OLSXMap](../api/map.md)
- [OLSXVectorLayer](../api/vector-layer.md)
- [성능 최적화](performance.md)
