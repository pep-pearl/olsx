<!--
@ai-purpose OLSX의 context hook과 headless hook 공개 API를 설명한다.
@ai-doc-kind api-reference
@ai-keywords useMapRefsContext, useMapReadyContext, useMapContext, useZoomControl, useBaseLayerControl, useDrawingControls, useDrawControl, useDrawingHistory, hooks
@ai-related docs/api/controls.md, docs/api/map.md, docs/guides/drawing.md
-->

# Hooks

## 개요

OLSX는 custom UI와 고급 OpenLayers 접근을 위해 context hook과 headless hook을 제공합니다. 먼저 component API를 사용하고, custom control이나 imperative 접근이 필요할 때 hook을 사용하세요.

## 가져오기

```tsx
import {
  useBaseLayerControl,
  useDrawingControls,
  useDrawControl,
  useDrawingHistory,
  useMapContext,
  useMapReadyContext,
  useMapRefsContext,
  useZoomControl,
} from "olsx";
```

## 기본 예제

```tsx
import { BaseLayer, OLSXMap, useBaseLayerControl, useZoomControl } from "olsx";

function CustomToolbar() {
  const zoom = useZoomControl();
  const baseLayer = useBaseLayerControl();

  if (!zoom.isReady || !baseLayer.isReady) return null;

  return (
    <div>
      <button type="button" onClick={() => zoom.zoomIn()}>
        +
      </button>
      <button type="button" onClick={() => zoom.zoomOut()}>
        -
      </button>
      <button type="button" onClick={baseLayer.toggle}>
        {baseLayer.nextType}
      </button>
    </div>
  );
}

export function CustomControlMap() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />
      <BaseLayer />
      <CustomToolbar />
    </OLSXMap>
  );
}
```

## Props / 옵션

### `useMapRefsContext()`

`mapRef`, `viewRef`, `layerRegistryRef`, `sourceRegistryRef`, `listenerRegistryRef`를 반환합니다. OpenLayers 객체에 직접 접근해야 할 때 사용하는 주 escape hatch입니다.

### `useMapReadyContext()`

`{ isMapReady }`를 반환합니다. component가 지도 초기화 여부만 알면 되는 경우에 사용합니다.

### `useMapContext()`

refs와 ready 상태를 함께 반환합니다. 호환성을 위해 유지되는 hook이며, 가능하면 분리된 hook을 우선 사용하세요.

### `useZoomControl()`

| Name | Type | Description |
| --- | --- | --- |
| `zoom` | `number` | 현재 view zoom입니다. |
| `isReady` | `boolean` | map과 view가 준비되었는지 나타냅니다. |
| `zoomIn` | `(step?: number) => void` | `step`만큼 zoom in animation을 실행합니다. 기본값은 `1`입니다. |
| `zoomOut` | `(step?: number) => void` | `step`만큼 zoom out animation을 실행합니다. 기본값은 `1`입니다. |
| `setZoom` | `(zoom: number) => void` | 지정한 zoom level로 animation합니다. |

### `useBaseLayerControl()`

| Name | Type | Description |
| --- | --- | --- |
| `type` | `"street" \| "satellite" \| null` | 현재 base-layer type입니다. |
| `nextType` | `"street" \| "satellite" \| null` | `toggle()` 호출 시 선택될 type입니다. |
| `isReady` | `boolean` | map과 base layer가 준비되었는지 나타냅니다. |
| `toggle` | `() => void` | street/satellite를 전환합니다. |
| `setType` | `(type) => void` | 명시적인 base-layer type을 설정합니다. |

### `useDrawingControls(options)`

`DrawingToolbar`와 같은 behavior option을 받습니다. `activeKind`, `defaultActiveKind`, `canUndo`, `canRedo`, `disabled`, command callback을 넘길 수 있고, active mode state와 command method를 반환합니다. `canUndo`, `canRedo`, command callback을 생략하면 mounted measurement preset의 command state와 undo/redo/clear 동작을 사용합니다.

### `useDrawControl()`

`OLSXVectorLayer.Draw` children 내부에서 사용합니다. draw id, active state, OpenLayers draw instance, 현재 sketch feature, pointer coordinate, drawing readiness를 반환합니다.

### `useDrawingHistory(initialResults?)`

완료된 drawing result와 `complete`, `deleteResult`, `undo`, `redo`, `clear`를 반환합니다. custom measurement preset을 만들 때 사용합니다.

## 동작

- map hook은 `OLSXMap` 내부에서 실행해야 합니다.
- base-layer hook은 mounted `BaseLayer`가 필요합니다.
- draw hook은 draw context를 읽기 때문에 `Draw` subtree 안에서 실행해야 합니다.
- headless hook은 UI를 렌더링하지 않고 state와 command만 제공합니다.
- `useZoomControl()`은 view resolution 변경을 구독해 `zoom` 값을 갱신합니다.

## 참고

- render 중에 mutable ref의 `.current`를 읽어 visible UI를 계산하지 마세요. effect, event handler, imperative callback에서 읽는 편이 안전합니다.
- readiness만 필요하면 `useMapContext()`보다 `useMapReadyContext()`를 사용하세요.
- 단순한 UI에는 custom hook보다 `Controls`가 더 적합합니다.

## 관련 문서

- [Controls](./controls.md)
- [OLSXMap](./map.md)
- [그리기와 측정](../guides/drawing.md)
