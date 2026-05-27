<!--
@ai-purpose DrawingToolbar와 measurement preset을 조합한 거리/면적/반경 측정 예제를 제공한다.
@ai-doc-kind example
@ai-keywords measurement, DrawingToolbar, DrawingControlKind, Draw.Distance, Draw.Area, Draw.Circle, distance, area, circle
@ai-related docs/api/vector-layer.md, docs/api/controls.md, docs/guides/drawing.md
-->

# 측정 도구

`DrawingToolbar` 컨트롤과 `OLSXVectorLayer.Draw` 컴포넌트를 조합하여 거리·면적·반경 측정 기능을 구성하는 예제입니다.

---

## 예제: 거리 / 면적 / 원 측정

```tsx
import { useState } from "react";
import {
  BaseLayer,
  Controls,
  OLSXMap,
  OLSXVectorLayer,
  type DrawingControlKind,
} from "olsx";

export function MeasurementMap() {
  const [activeKind, setActiveKind] = useState<DrawingControlKind | null>(null);

  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={14} />
      <BaseLayer />

      <Controls>
        <Controls.Zoom />
        <Controls.DrawingToolbar
          activeKind={activeKind}
          onActiveKindChange={setActiveKind}
        />
      </Controls>

      <OLSXVectorLayer id="measurements">
        <OLSXVectorLayer.Source />
        <OLSXVectorLayer.Draw.Distance active={activeKind === "distance"} />
        <OLSXVectorLayer.Draw.Area active={activeKind === "area"} />
        <OLSXVectorLayer.Draw.Circle active={activeKind === "circle"} />
      </OLSXVectorLayer>
    </OLSXMap>
  );
}
```

---

## 설명

### `DrawingToolbar`로 측정 모드 전환

`Controls.DrawingToolbar`는 측정 도구 버튼 그룹을 렌더링합니다. `activeKind` / `onActiveKindChange`를 통해 현재 활성화된 측정 모드를 controlled state로 관리합니다.

### 측정 종류

| 컴포넌트 | 모드 | 동작 |
|---|---|---|
| `Draw.Distance` | `"distance"` | 구간별 거리와 총 거리를 표시합니다 |
| `Draw.Area` | `"area"` | 다각형의 면적을 표시합니다 |
| `Draw.Circle` | `"circle"` | 원의 반경을 표시합니다 |

### 키보드 단축키

| 키 | 동작 |
|---|---|
| 우클릭 (Right click) | 그리기 완료 |
| `Esc` | 그리기 취소 |
| `Ctrl+Z` | 마지막 포인트 취소 (undo) |
| `Ctrl+Shift+Z` | 취소한 포인트 복원 (redo) |

### 완료 후 동작

측정이 완료되면 결과 도형 위에 삭제 버튼이 포함된 팝업이 표시됩니다. 사용자는 이 버튼을 클릭하여 개별 측정 결과를 제거할 수 있습니다.

> [!NOTE]
> 모든 `Draw.*` 컴포넌트는 같은 `OLSXVectorLayer` 안에 배치해야 합니다. 각 컴포넌트의 `active` prop이 `true`일 때만 해당 측정 모드가 활성화됩니다. 동시에 여러 모드를 활성화하지 않도록 주의하세요.

---

## 관련 문서

- [VectorLayer API](../api/vector-layer.md)
- [그리기 가이드](../guides/drawing.md)
- [Controls API](../api/controls.md)
