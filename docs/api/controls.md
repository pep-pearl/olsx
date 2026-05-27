<!--
@ai-purpose Controls compound component와 headless control hook의 공개 사용법을 설명한다.
@ai-doc-kind api-reference
@ai-keywords Controls, ZoomControl, BaseLayerToggle, DrawingToolbar, useZoomControl, useBaseLayerControl, useDrawingControls, zoom, base layer, drawing toolbar
@ai-related docs/api/hooks.md, docs/guides/drawing.md, docs/examples/measurement.md
-->

# Controls

## 개요

`Controls`는 자주 쓰는 지도 조작 UI를 제공합니다. 기본 zoom button, base-layer toggle, drawing toolbar가 충분하면 ready-to-use component를 사용하고, UI를 직접 만들고 싶다면 headless hook을 사용합니다.

## 가져오기

```tsx
import {
  Controls,
  BaseLayerToggle,
  DrawingToolbar,
  ZoomControl,
  useBaseLayerControl,
  useDrawingControls,
  useZoomControl,
} from "olsx";
```

## 기본 예제

```tsx
import { BaseLayer, Controls, OLSXMap } from "olsx";

export function MapControls() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />
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

### `Controls`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `className` | `string` | - | - | controls container에 붙일 CSS class입니다. |
| `style` | `React.CSSProperties` | - | built-in controls style | controls container의 inline style입니다. |
| `children` | `React.ReactNode` | - | - | control button이나 custom UI를 배치합니다. |

### `Controls.Zoom` / `ZoomControl`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode \| (control) => React.ReactNode` | - | built-in zoom buttons | custom zoom UI입니다. function children은 `ZoomControlApi`를 받습니다. |

### `Controls.BaseLayerToggle` / `BaseLayerToggle`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `className` | `string` | - | - | button에 붙일 CSS class입니다. |
| `style` | `React.CSSProperties` | - | built-in button style | button의 inline style입니다. |
| `children` | `React.ReactNode \| (control) => React.ReactNode` | - | built-in icon button | custom toggle UI입니다. function children은 `BaseLayerControl`을 받습니다. |

### `Controls.DrawingToolbar` / `DrawingToolbar`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `activeKind` | `"distance" \| "area" \| "circle" \| null` | - | internal state | controlled active drawing mode입니다. |
| `defaultActiveKind` | `"distance" \| "area" \| "circle" \| null` | - | `null` | uncontrolled 사용 시 초기 drawing mode입니다. |
| `canUndo` | `boolean` | - | `false` | undo button을 활성화합니다. |
| `canRedo` | `boolean` | - | `false` | redo button을 활성화합니다. |
| `disabled` | `boolean` | - | `false` | toolbar command를 비활성화합니다. |
| `onActiveKindChange` | `(kind) => void` | - | - | drawing mode가 바뀔 때 호출됩니다. |
| `onCancel` | `() => void` | - | - | cancel button 클릭 시 호출됩니다. |
| `onUndo` | `() => void` | - | - | undo button 클릭 시 호출됩니다. |
| `onRedo` | `() => void` | - | - | redo button 클릭 시 호출됩니다. |
| `onClear` | `() => void` | - | - | clear button 클릭 시 호출됩니다. |
| `className` | `string` | - | - | toolbar에 붙일 CSS class입니다. |
| `style` | `React.CSSProperties` | - | built-in toolbar style | toolbar의 inline style입니다. |
| `buttonStyle` | `React.CSSProperties` | - | built-in button style | toolbar button의 inline style입니다. |
| `children` | `React.ReactNode \| (control) => React.ReactNode` | - | built-in icon toolbar | custom toolbar UI입니다. function children은 `DrawingControls`를 받습니다. |

## 동작

- `Controls`는 layout wrapper입니다. OpenLayers control 객체를 직접 만들지는 않습니다.
- `Controls.Zoom`은 현재 view zoom을 읽고 zoom 변경을 animation으로 적용합니다.
- `Controls.BaseLayerToggle`은 mounted `BaseLayer`가 필요하며, `street`과 `satellite`를 전환합니다.
- `Controls.DrawingToolbar`는 drawing mode 선택과 command callback을 관리합니다. 실제 측정 drawing은 `OLSXVectorLayer.Draw.Distance`, `Area`, `Circle`에서 수행합니다.
- 기본 control component는 필요한 map context가 준비되기 전까지 `null`을 반환합니다.

## 참고

- `Controls.ZoomButton`, `Controls.ToggleBaseLayerButton`은 호환 alias입니다.
- OLSX의 상태 wiring은 유지하고 UI만 바꾸고 싶다면 function children을 사용하세요.
- 완전한 custom toolbar에는 [Hooks](./hooks.md)의 headless hook을 권장합니다.

## 관련 문서

- [Hooks](./hooks.md)
- [OLSXMap](./map.md)
- [그리기와 측정](../guides/drawing.md)
- [측정 도구 예제](../examples/measurement.md)
