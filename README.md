<!--
@ai-purpose OLSX 공식 문서의 최상위 진입점이다.
@ai-doc-kind documentation-entrypoint
@ai-keywords OLSX, README, installation, quick start, API docs, guides, examples, OpenLayers, React map
@ai-related docs/getting-started/installation.md, docs/getting-started/quick-start.md, docs/api/map.md, docs/api/vector-layer.md
-->

# OLSX

React에서 OpenLayers 지도를 선언적으로 구성하기 위한 컴포넌트 라이브러리입니다.

## 개요

OLSX는 자주 쓰는 지도 구성은 React 컴포넌트로 빠르게 붙이고, 깊은 제어가 필요한 곳에서는 ref와 registry로 OpenLayers 객체에 직접 접근할 수 있게 합니다.

## 주요 기능

- **OLSXMap** — OpenLayers Map 인스턴스와 공유 registry를 소유하는 provider
- **BaseLayer** — street/satellite 기본 배경지도 preset
- **OLSXTileLayer** — custom tile source를 붙이는 generic tile layer
- **OLSXVectorLayer** — vector layer, source, feature, draw를 묶은 compound API
- **createVectorLayer()** — feature type/data type을 고정한 typed vector layer factory
- **OLSXOverlay** — React children을 OpenLayers Overlay에 portal로 렌더링
- **Controls** — 기본 zoom, base-layer toggle, drawing toolbar UI
- **Headless hooks** — `useZoomControl`, `useBaseLayerControl`, `useDrawingControls` 등 커스텀 UI용 hook
- **Measurement presets** — 거리, 면적, 반경 측정 도구 (undo/redo/delete 지원)

## 설치

> **참고:** 이 패키지는 아직 private 상태이며 npm에 배포되지 않았습니다.

```sh
npm install olsx ol react react-dom
```

피어 의존성:

- `react` ^18 || ^19
- `react-dom` ^18 || ^19
- `ol` ^10

## 빠른 시작

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

## 문서

- **시작하기**
  - [설치](docs/getting-started/installation.md)
  - [빠른 시작](docs/getting-started/quick-start.md)
  - [마이그레이션](docs/getting-started/migration.md)
- **API 레퍼런스**
  - [OLSXMap](docs/api/map.md)
  - [OLSXVectorLayer](docs/api/vector-layer.md)
  - [Controls](docs/api/controls.md)
  - [OLSXOverlay](docs/api/overlay.md)
  - [Hooks](docs/api/hooks.md)
- **가이드**
  - [그리기와 측정](docs/guides/drawing.md)
  - [이벤트 처리](docs/guides/events.md)
  - [성능 최적화](docs/guides/performance.md)
  - [커스텀 레이어](docs/guides/custom-layer.md)
  - [아키텍처](docs/guides/architecture.md)

## 예제

- [기본 지도](docs/examples/basic-map.md) — 최소 지도 렌더링, Map ref 접근
- [벡터 마커](docs/examples/vector-markers.md) — createVectorLayer로 typed 마커 표시
- [팝업 오버레이](docs/examples/popup-overlay.md) — Feature 클릭 → 오버레이 팝업
- [측정 도구](docs/examples/measurement.md) — 거리/면적/반경 측정

## 개발

```sh
npm install
npm run dev        # playground 실행
npm run lint
npm test
npm run build
```

`npm test`는 TypeScript 테스트 산출물을 `node_modules/.tmp/test-dist`에 만든 뒤 Node test runner로 실행합니다.

## AI 내비게이션

AI agent는 [AI_INDEX.md](AI_INDEX.md)와 [AGENTS.md](AGENTS.md)에서 탐색을 시작합니다.
