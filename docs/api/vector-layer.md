<!--
@ai-purpose OLSXVectorLayer compound API의 공개 사용법과 동작을 설명한다.
@ai-doc-kind api-reference
@ai-keywords OLSXVectorLayer, createVectorLayer, featureTypes, featureType, Source, Feature, Features, Draw, Distance, Area, Circle, vector layer, measurement
@ai-related docs/guides/drawing.md, docs/guides/events.md, docs/examples/vector-markers.md, docs/examples/measurement.md
-->

# OLSXVectorLayer

## 개요

`OLSXVectorLayer`는 OpenLayers vector data를 다루기 위한 compound API입니다. feature, data 기반 marker group, feature event, drawing interaction, 측정 preset이 필요할 때 사용합니다.

기본 구조는 다음과 같습니다.

```txt
OLSXVectorLayer
  .Source
  .Feature
  .Features
  .Draw
    .Tooltip
    .Distance
    .Area
    .Circle
```

feature type과 data type을 좁혀 쓰고 싶다면 `createVectorLayer()`를 사용합니다.

## 가져오기

```tsx
import {
  OLSXVectorLayer,
  createVectorLayer,
  type OLSXVectorLayerRef,
  type OLSXVectorSourceRef,
} from "olsx";
```

## 기본 예제

```tsx
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { BaseLayer, OLSXMap, OLSXVectorLayer } from "olsx";

const places = [
  { id: "city-hall", name: "Seoul City Hall", lon: 126.9784, lat: 37.5666 },
];

export function VectorMap() {
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
          onClick={(place) => console.log(place.name)}
        />
      </OLSXVectorLayer>
    </OLSXMap>
  );
}
```

## Props / 옵션

### `OLSXVectorLayer`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `string` | Yes | - | OpenLayers vector layer를 등록할 registry id입니다. |
| `featureTypes` | `readonly string[]` | - | `[]` | style과 child prop에서 사용할 feature type label 목록입니다. |
| `style` | `(feature, featureType?) => Style \| Style[] \| void` | - | - | OpenLayers style resolver입니다. OLSX가 저장한 feature type을 함께 받습니다. |
| `cacheStyle` | `boolean` | - | `true` | 안정적인 feature/type 조합의 style 결과를 cache합니다. 외부 상태에 따라 style이 자주 바뀌면 `false`로 둡니다. |
| `children` | `React.ReactNode` | - | - | 보통 `Source`, `Feature`, `Features`, `Draw`를 배치합니다. |

### `OLSXVectorLayer.Source`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `ref` | `React.Ref<OLSXVectorSourceRef>` | - | - | OpenLayers vector source와 source 내부 feature registry에 접근합니다. |

### `OLSXVectorLayer.Feature`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `string` | Yes | - | 단일 feature의 registry id입니다. |
| `featureType` | `string` | - | - | style resolution과 event에 전달할 feature type입니다. |
| `geometry` | `Geometry` | - | - | feature에 사용할 OpenLayers geometry입니다. |
| `data` | `object` | Yes | - | feature에 연결할 domain data입니다. |
| `onClick` | `(item, feature) => void` | - | - | feature click 시 호출됩니다. |
| `onHover` | `(item, feature) => void` | - | - | feature hover 시 호출됩니다. |

### `OLSXVectorLayer.Features`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `string` | Yes | - | feature group의 registry id입니다. |
| `featureType` | `string` | Yes | - | 생성되는 모든 feature에 붙일 feature type입니다. |
| `data` | `Array<TData>` | Yes | - | OpenLayers feature로 렌더링할 data 배열입니다. |
| `getId` | `(item) => string` | Yes | - | diff/upsert에 사용할 안정적인 id입니다. |
| `getGeometry` | `(item) => Geometry` | Yes | - | data item을 OpenLayers geometry로 변환합니다. |
| `onClick` | `(item, feature) => void` | - | - | 원본 data item과 OpenLayers feature를 함께 받습니다. |
| `onHover` | `(item, feature) => void` | - | - | 원본 data item과 OpenLayers feature를 함께 받습니다. |

### `OLSXVectorLayer.Draw`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `string` | - | React-generated id | draw listener key에 사용할 안정적인 id입니다. |
| `active` | `boolean` | - | `true` | draw interaction을 다시 만들지 않고 활성/비활성만 바꿉니다. |
| `type` | OpenLayers geometry `Type` | - | `"LineString"` | OpenLayers `Draw`에 전달할 geometry type입니다. |
| `style` | `StyleLike \| FlatStyleLike` | - | built-in sketch style | draw interaction의 sketch style입니다. |
| `onDrawStart` | `(event) => void` | - | - | OpenLayers draw start callback입니다. |
| `onDrawEnd` | `(event) => void` | - | - | OpenLayers draw end callback입니다. |
| `onDrawAbort` | `(event) => void` | - | - | OpenLayers draw abort callback입니다. |
| `children` | `React.ReactNode \| (props) => React.ReactNode` | - | - | draw context 내부에 렌더링할 UI입니다. |

### 측정 preset

`Draw.Distance`, `Draw.Area`, `Draw.Circle`은 아래 prop을 공유합니다.

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `string` | - | `"distance"`, `"area"`, `"circle"` | result와 overlay id의 prefix입니다. |
| `active` | `boolean` | - | `true` | 측정 mode를 활성화합니다. |
| `style` | `StyleLike \| FlatStyleLike` | - | built-in measurement style | 완료된 측정 feature의 style입니다. |
| `onComplete` | `(result) => void` | - | - | 측정 result가 완료될 때 호출됩니다. |
| `onDelete` | `(result) => void` | - | - | result popup에서 삭제할 때 호출됩니다. |

## 동작

- `OLSXVectorLayer`는 OpenLayers vector layer를 mount하고 `id`로 등록합니다.
- `Source`는 feature와 drawing child가 공유할 vector source를 만듭니다.
- `Feature`는 단일 OpenLayers feature를 등록하고 unmount 시 제거합니다.
- `Features`는 `getId()` 기준으로 diff합니다. 새 id는 추가하고, 사라진 id는 제거하며, 유지되는 id는 기존 feature의 geometry와 metadata만 갱신합니다.
- feature click/hover handler는 map-level listener registry에 등록되어 unmount 시 id 기반으로 cleanup됩니다.
- `Draw`는 OpenLayers `Draw` interaction 하나를 만들고, `active` 변경 시 `draw.setActive(active)`만 호출합니다.
- 측정 preset은 result popup, delete, undo/redo, source cleanup을 하나의 drawing id 단위로 관리합니다.
- Distance/Area 우클릭 완료는 pointer preview나 contextmenu coordinate를 최종 point로 추가하지 않고 마지막 left-click point를 기준으로 완료합니다. Circle 우클릭은 현재 preview radius를 추가하지 않고 center 작업을 종료합니다.
- 측정 preset은 mode별 primary color와 active cursor를 적용합니다. Circle 측정은 center point, radius endpoint point, center-to-endpoint line을 유지하고 popup을 endpoint에 고정합니다.

## 참고

- `Feature`, `Features`, `Draw`는 `Source` 아래에 배치해야 합니다.
- id는 안정적으로 유지하세요. layer, source, feature, group id가 바뀌면 cleanup 후 다시 등록됩니다.
- public prop 이름은 `featureTypes`와 `featureType`입니다.
- `createVectorLayer<TTypes, TData>()`는 같은 compound API를 typed component로 반환합니다.
- 예제 좌표는 OpenLayers map projection에 맞추기 위해 `fromLonLat()`을 사용합니다.

## 관련 문서

- [이벤트 처리](../guides/events.md)
- [그리기와 측정](../guides/drawing.md)
- [벡터 마커 예제](../examples/vector-markers.md)
- [측정 도구 예제](../examples/measurement.md)
