<!--
@ai-purpose OLSXMap과 OLSXMap.View의 공개 API, ref, context hook 동작을 설명한다.
@ai-doc-kind api-reference
@ai-keywords OLSXMap, OLSXMap.View, OLSXMapRef, OLSXViewRef, defaultCenter, defaultZoom, defaultControl, map registry, useMapRefsContext
@ai-related docs/api/hooks.md, docs/api/controls.md, docs/api/vector-layer.md, docs/api/overlay.md
-->

# OLSXMap

## 개요

`OLSXMap`은 OpenLayers `Map` 인스턴스와 공유 registry를 소유하는 최상위 provider 컴포넌트입니다. 모든 OLSX 컴포넌트는 `OLSXMap` 내부에서 사용해야 합니다.

`OLSXMap.View`는 OpenLayers `View`를 별도 컴포넌트로 선언하며, `map.setView()`로 연결합니다.

## 가져오기

```tsx
import { OLSXMap, type OLSXMapRef } from "olsx";
```

## 기본 예제

```tsx
import { BaseLayer, Controls, OLSXMap } from "olsx";

export function BasicMap() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={16} />

      <BaseLayer />

      <Controls>
        <Controls.BaseLayerToggle />
        <Controls.Zoom />
      </Controls>
    </OLSXMap>
  );
}
```

## Props / 옵션

### `OLSXMap`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `defaultControl` | `Control[] \| Collection<Control>` | - | OpenLayers 기본 | OpenLayers 기본 컨트롤을 교체합니다. 빈 배열 `[]`을 넘기면 기본 컨트롤이 제거됩니다. |
| `style` | `React.CSSProperties` | - | - | 지도 컨테이너의 인라인 스타일입니다. |
| `children` | `React.ReactNode` | - | - | `OLSXMap.View`, 레이어, 오버레이, 컨트롤 등을 자식으로 배치합니다. |

### `OLSXMap.View`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `defaultCenter` | `[number, number]` | - | - | 초기 중심 좌표입니다. EPSG:4326 (경도, 위도) 형식이며, 내부에서 `fromLonLat`로 변환됩니다. |
| `defaultZoom` | `number` | - | - | 초기 줌 레벨입니다. |

## Ref

### `OLSXMapRef`

`OLSXMap`에 `ref`를 걸면 아래 API에 접근할 수 있습니다.

```ts
type OLSXMapRef = {
  getMap: () => OlMap | null;
  getView: () => View | null;
  getLayerRegistry: () => Map<string, Layer>;
  getSourceRegistry: () => Map<string, VectorSource>;
  getListenerRegistry: () => ListenerRegistry;
  isMapReady: boolean;
};
```

| Method | Description |
| --- | --- |
| `getMap()` | OpenLayers `Map` 인스턴스를 반환합니다. |
| `getView()` | 현재 `View`를 반환합니다. |
| `getLayerRegistry()` | id → `Layer` 매핑 registry입니다. |
| `getSourceRegistry()` | id → `VectorSource` 매핑 registry입니다. |
| `getListenerRegistry()` | id 기반 map-level event listener registry입니다. |
| `isMapReady` | 지도 초기화 완료 여부입니다. |

### `OLSXViewRef`

`OLSXMap.View`에 `ref`를 걸면 View 인스턴스에 직접 접근할 수 있습니다.

```ts
type OLSXViewRef = {
  getView: () => View | null;
};
```

## Map Ref 예제

```tsx
import { useRef } from "react";
import { OLSXMap, type OLSXMapRef } from "olsx";

export function MapWithRegistry() {
  const mapRef = useRef<OLSXMapRef>(null);

  return (
    <OLSXMap ref={mapRef} style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />

      <button
        type="button"
        onClick={() => {
          const map = mapRef.current?.getMap();
          const layers = mapRef.current?.getLayerRegistry();
          const sources = mapRef.current?.getSourceRegistry();
          const listeners = mapRef.current?.getListenerRegistry();
          console.log({ map, layers, sources, listeners });
        }}
      >
        Inspect
      </button>
    </OLSXMap>
  );
}
```

## Context Hooks

`OLSXMap` 내부에서 사용할 수 있는 context hook입니다.

### `useMapRefsContext()`

```ts
import { useMapRefsContext } from "olsx";
```

`mapRef`, `viewRef`, `layerRegistryRef`, `sourceRegistryRef`, `listenerRegistryRef`에 접근합니다. OpenLayers 객체에 직접 접근해야 할 때 사용하는 **권장 escape hatch**입니다.

### `useMapReadyContext()`

```ts
import { useMapReadyContext } from "olsx";
```

지도 ready 상태(`isMapReady`)만 구독합니다. refs가 필요 없고 ready 여부만 알면 되는 경우에 사용합니다.

### `useMapContext()`

```ts
import { useMapContext } from "olsx";
```

refs와 ready 상태를 함께 가져오는 **호환 hook**입니다. `useMapRefsContext`와 `useMapReadyContext`를 합친 것과 동일합니다.

## 동작

- `OLSXMap`은 mount 시 OpenLayers `Map`을 생성하고, unmount 시 `map.dispose()`를 호출합니다.
- `OLSXMap.View`는 `View`를 생성하여 `map.setView()`로 연결합니다.
- `listenerRegistryRef`는 map-level event listener를 id로 관리합니다. Feature click/hover 이벤트도 listener registry에 등록되며, unmount 시 registry cleanup을 통해 해제됩니다.
- Map refs와 ready 상태는 별도 context(`MapRefsContext`, `MapReadyContext`)로 분리되어 있어, hook이 필요한 부분만 구독할 수 있습니다.

## 참고

- `defaultCenter`와 `defaultZoom`은 **초기값**입니다. 이후 뷰 변경은 `ref`를 통해 OpenLayers `View` API를 직접 사용해야 합니다.
- `defaultControl`에 빈 배열 `[]`을 넘기면 OpenLayers 기본 컨트롤(줌, 회전 등)을 모두 제거할 수 있습니다.
- `useMapRefsContext`가 반환하는 값은 `MutableRefObject`이므로 render 중에는 `.current`를 읽지 말고, 이벤트 핸들러나 effect 내에서 사용하세요.

## 관련 문서

- [Controls](./controls.md) — 줌, 배경지도 토글, 그리기 도구 UI
- [OLSXVectorLayer](./vector-layer.md) — 벡터 레이어와 feature 관리
- [OLSXOverlay](./overlay.md) — 지도 위 React UI 렌더링
- [Hooks](./hooks.md) — 전체 hook 목록
