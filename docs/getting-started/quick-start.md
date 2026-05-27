<!--
@ai-purpose OLSX를 처음 사용하는 사용자를 위한 가장 짧은 지도 구성 예제를 제공한다.
@ai-doc-kind getting-started
@ai-keywords quick start, OLSXMap, BaseLayer, Controls, OLSXMap.View, component hierarchy
@ai-related docs/getting-started/installation.md, docs/examples/basic-map.md, docs/api/map.md
-->

# 빠른 시작

## 가장 짧은 지도

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

`OLSXMap`은 OpenLayers `Map` 인스턴스와 공유 registry를 만들고, `OLSXMap.View`는 `View`를 생성하여 `map.setView()`로 연결합니다.

## 컴포넌트 계층 구조

```
OLSXMap
├── OLSXMap.View
├── BaseLayer
├── OLSXVectorLayer
│   ├── Source
│   │   ├── Feature / Features
│   │   └── Draw
│   └── ...
├── OLSXOverlay
└── Controls
```

모든 자식 컴포넌트는 `OLSXMap` 안에 위치해야 합니다. `OLSXMap`이 제공하는 context를 통해 map 인스턴스와 registry에 접근합니다.

## 다음 단계

- [OLSXMap API](../api/map.md) — Map/View props, ref, registry 접근
- [벡터 마커 예제](../examples/vector-markers.md) — 데이터 기반 마커 표시
- [팝업 오버레이 예제](../examples/popup-overlay.md) — Feature 클릭 시 팝업
- [아키텍처 가이드](../guides/architecture.md) — 설계 원칙과 컴포넌트 계층

## 관련 문서

- [설치](installation.md)
- [기본 지도 예제](../examples/basic-map.md)
