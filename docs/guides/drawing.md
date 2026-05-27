<!--
@ai-purpose OLSX에서 drawing interaction과 측정 preset을 조합하는 방법을 설명한다.
@ai-doc-kind guide
@ai-keywords drawing, measurement, distance, area, circle, DrawingToolbar, useDrawingControls, Draw.Distance, Draw.Area, Draw.Circle
@ai-related docs/api/vector-layer.md, docs/api/controls.md, docs/examples/measurement.md
-->

# 그리기와 측정

## 목표

사용자가 지도 위에 geometry를 그리고, 거리·면적·반경을 측정할 수 있는 workflow를 구성합니다.

## 언제 사용할까

OpenLayers의 기본 draw interaction을 직접 다루고 draw event를 처리하려면 `OLSXVectorLayer.Draw`를 사용합니다.

label, result popup, delete button, undo/redo가 포함된 측정 기능이 필요하면 `OLSXVectorLayer.Draw.Distance`, `Draw.Area`, `Draw.Circle`을 사용합니다.

## 예제

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

## 설명

drawing은 OpenLayers vector source에 feature를 추가하므로 vector layer 내부에 배치합니다. source가 하나로 정해져 있어야 sketch feature, 완료된 측정 feature, overlay label을 같은 위치에서 관리할 수 있습니다.

측정 preset은 generic OpenLayers `Draw` interaction과 별개로 manual drawing 방식을 사용합니다. 이 방식은 result popup, delete action, undo/redo, source cleanup을 하나의 drawing id에 묶어 관리하기 쉽습니다.

## 작업 흐름

1. drawing 전용 `OLSXVectorLayer`를 추가합니다.
2. `OLSXVectorLayer.Source`를 추가합니다.
3. React state로 active drawing kind를 관리합니다.
4. 지원할 측정 종류별 component를 렌더링합니다.
5. 한 번에 하나의 mode만 활성화되도록 `active={activeKind === "..."}`를 넘깁니다.

## 절충점

- 측정 preset은 빠르게 붙일 수 있지만 label과 완료 동작이 어느 정도 정해져 있습니다.
- `OLSXVectorLayer.Draw`는 OpenLayers 제어권이 더 크지만 result UI와 cleanup을 직접 만들어야 합니다.
- drawing mode는 viewport와 keyboard listener를 붙입니다. toolbar 변경이 잦다면 component를 자주 unmount하기보다 `active={false}`로 유지하는 편이 낫습니다.

## 관련 문서

- [OLSXVectorLayer](../api/vector-layer.md)
- [Controls](../api/controls.md)
- [측정 도구 예제](../examples/measurement.md)
- [내부 측정 QA 노트](../internal/drawing-measurement-qa.md)
