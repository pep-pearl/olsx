<!--
@ai-purpose OLSXOverlay의 공개 API, portal 렌더링, 위치 동기화 동작을 설명한다.
@ai-doc-kind api-reference
@ai-keywords OLSXOverlay, OLSXOverlayRef, overlay, popup, portal, coordinate, visible, positioning, autoPan, stopEvent
@ai-related docs/api/map.md, docs/api/vector-layer.md, docs/examples/popup-overlay.md
-->

# OLSXOverlay

## 개요

`OLSXOverlay`는 React children을 OpenLayers `Overlay`의 element에 portal로 렌더링하는 컴포넌트입니다. 팝업, 라벨, 콜아웃, 지도에 고정된 UI 등을 만들 때 사용합니다.

## 가져오기

```tsx
import { OLSXOverlay, type OLSXOverlayRef } from "olsx";
```

## 기본 예제

```tsx
import { fromLonLat } from "ol/proj";
import { OLSXMap, OLSXOverlay } from "olsx";

export function PopupMap() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />

      <OLSXOverlay
        id="selected-place"
        coordinate={fromLonLat([126.9784, 37.5666])}
        positioning="bottom-center"
        offset={[0, -16]}
        autoPan
        stopEvent
      >
        <div style={{ background: "white", padding: 12 }}>Seoul City Hall</div>
      </OLSXOverlay>
    </OLSXMap>
  );
}
```

## Props / 옵션

```ts
type OLSXOverlayProps = {
  id?: string | number;
  coordinate?: Coordinate | null;
  visible?: boolean;
  positioning?: Positioning;
  offset?: [number, number];
  autoPan?: boolean | AutoPanOptions;
  stopEvent?: boolean;
  insertFirst?: boolean;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  children?: React.ReactNode;
  element?: HTMLElement | null;
};
```

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `id` | `string \| number` | - | - | 오버레이 식별자입니다. |
| `coordinate` | `Coordinate \| null` | - | - | 오버레이가 표시될 지도 좌표입니다. `null`이면 오버레이가 숨겨집니다. |
| `visible` | `boolean` | - | `true` | `false`로 설정하면 오버레이를 숨깁니다. |
| `positioning` | `Positioning` | - | - | 좌표 기준 오버레이 위치를 지정합니다. `"bottom-center"`, `"top-left"` 등 OpenLayers `Positioning` 값을 사용합니다. |
| `offset` | `[number, number]` | - | - | 좌표 위치에서 px 단위 오프셋 `[x, y]`입니다. |
| `autoPan` | `boolean \| AutoPanOptions` | - | - | `true`이면 오버레이가 뷰포트 밖에 있을 때 자동으로 지도를 이동합니다. |
| `stopEvent` | `boolean` | - | - | `true`이면 오버레이 내의 이벤트가 지도로 전파되지 않습니다. 클릭 가능한 팝업에 권장됩니다. |
| `insertFirst` | `boolean` | - | - | `true`이면 오버레이를 다른 오버레이보다 먼저(뒤에) 삽입합니다. |
| `className` | `string` | - | - | 오버레이 컨테이너의 CSS 클래스입니다. |
| `style` | `React.CSSProperties` | - | - | 오버레이 컨테이너의 인라인 스타일입니다. |
| `zIndex` | `number` | - | - | 오버레이의 z-index입니다. |
| `children` | `React.ReactNode` | - | - | portal로 렌더링할 React 요소입니다. |
| `element` | `HTMLElement \| null` | - | - | 직접 제공할 DOM element입니다. 보통은 `children`을 사용합니다. |

## Ref

```ts
type OLSXOverlayRef = {
  getOverlay: () => OlOverlay | null;
  setPosition: (coordinate: Coordinate | null | undefined) => void;
  panIntoView: (options?: AutoPanOptions) => void;
  hide: () => void;
};
```

| Method | Description |
| --- | --- |
| `getOverlay()` | OpenLayers `Overlay` 인스턴스를 반환합니다. |
| `setPosition(coordinate)` | 오버레이 위치를 직접 변경합니다. `null` 또는 `undefined`를 넘기면 숨깁니다. |
| `panIntoView(options?)` | 오버레이가 보이도록 지도를 이동합니다. |
| `hide()` | `setPosition(undefined)`를 호출하여 오버레이를 숨깁니다. |

## 동작

- `visible`이 `false`이거나 `coordinate`가 `null`/`undefined`이면 내부적으로 `setPosition(undefined)`를 호출하여 오버레이를 숨깁니다.
- `children`은 React portal을 통해 OpenLayers `Overlay`의 DOM element에 렌더링됩니다.
- mount 시 `map.addOverlay()`로 등록되고, unmount 시 `map.removeOverlay()`로 제거됩니다.
- `coordinate`가 변경되면 오버레이 위치가 업데이트됩니다.

## 참고

- `coordinate`는 **map projection 좌표**(기본 EPSG:3857)를 사용합니다. EPSG:4326 좌표를 사용하려면 `fromLonLat()`으로 변환하세요.
- 클릭 가능한 팝업에는 `stopEvent`를 `true`로 설정하여 클릭 이벤트가 지도로 전파되지 않도록 하세요.
- Drawing tooltip처럼 포인터를 따라가는 오버레이는 `stopEvent={false}`와 `insertFirst={false}`를 사용합니다.

## 관련 문서

- [OLSXMap](./map.md) — 지도 provider
- [OLSXVectorLayer.Draw.Tooltip](./vector-layer.md) — Draw 중 자동으로 포인터를 따라가는 tooltip overlay
