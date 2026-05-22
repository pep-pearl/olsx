# OLSX

OLSX는 초기 단계의 React + OpenLayers 모듈입니다. OpenLayers의 지도 객체와 확장 가능성은 열어 두면서, React 사용자가 타입이 잡힌 컴포넌트와 훅으로 빠르게 지도를 구성할 수 있도록 돕는 것을 목표로 합니다.

이 프로젝트는 OpenLayers를 완전히 숨기는 두꺼운 블랙박스 래퍼를 지향하지 않습니다. 대신 자주 쓰는 지도 구성은 React스럽게 제공하고, 더 깊은 커스터마이징이 필요한 사용자는 OpenLayers 객체에 직접 접근할 수 있게 합니다.

## 대상 사용자

- OpenLayers 중심 사용자: 기본 UI와 React 생명주기 연결은 제공받되, 내부 레이어와 동작은 자유롭게 바꾸고 싶은 사용자.
- React 중심 사용자: OpenLayers를 깊게 알지 못해도 타입이 있는 컴포넌트, 훅, 예제로 빠르게 지도를 붙이고 싶은 사용자.

## 핵심 특징

- OpenLayers `Map`을 생성하고 관리하는 `OLSXMap` provider.
- 하위 컴포넌트가 공유하는 layer/source registry.
- street/satellite 기본 타일 레이어를 제공하는 `BaseLayer` preset.
- zoom 및 base layer toggle을 포함한 기본 `Controls` compound component.
- vector layer, vector source, typed feature set을 묶은 `OLSXVectorLayer` compound API.
- 도메인별 feature data 타입을 고정할 수 있는 `createVectorLayer` factory.
- 직접 OpenLayers를 제어할 수 있는 `useMapContext` escape hatch.

## 설치

이 프로젝트는 현재 private/초기 단계입니다. 패키지로 배포된 경우 설치 방식은 다음과 같습니다.

```sh
npm install olx ol react react-dom
```

이 저장소에서 로컬 개발을 할 때는 다음 명령을 사용합니다.

```sh
npm install
```

## 빠른 시작

```tsx
import { BaseLayer, Controls, OLSXMap } from "olx";

export function MapView() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <BaseLayer />

      <Controls>
        <Controls.ToggleBaseLayerButton />
        <Controls.ZoomButton />
      </Controls>
    </OLSXMap>
  );
}
```

## Vector Layer 예시

```tsx
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { BaseLayer, createVectorLayer, OLSXMap } from "olx";

const placeTypes = ["marker"] as const;

type Place = {
  id: string;
  name: string;
  lon: number;
  lat: number;
};

const PlaceLayer = createVectorLayer<typeof placeTypes, Place>();

export function PlacesMap({ places }: { places: Place[] }) {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <BaseLayer />

      <PlaceLayer id="places" types={placeTypes}>
        <PlaceLayer.Source />
        <PlaceLayer.FeatureSet
          type="marker"
          data={places}
          getId={(place) => place.id}
          getGeometry={(place) => new Point(fromLonLat([place.lon, place.lat]))}
          onClick={(place) => {
            console.log(place.name);
          }}
        />
      </PlaceLayer>
    </OLSXMap>
  );
}
```

## 커스터마이징과 확장

빠른 기본 구성이 필요하면 내장 preset을 사용합니다.

- `BaseLayer`: street/satellite 타일 레이어.
- `Controls`: 기본 지도 컨트롤 UI.
- `OLSXVectorLayer`: vector data 렌더링.

직접 OpenLayers를 다뤄야 한다면 낮은 수준의 확장 지점을 사용합니다.

- `useMapContext()`로 OpenLayers map ref와 layer/source registry에 접근할 수 있습니다.
- custom layer component는 React effect 안에서 OpenLayers layer를 직접 mount/unmount할 수 있습니다.
- `createVectorLayer()`로 도메인 feature data 타입에 맞춘 typed compound component를 만들 수 있습니다.
- `BaseLayer`는 교체 가능한 preset입니다. 고급 사용자는 `useMapContext`를 사용해 직접 base layer 컴포넌트를 작성할 수 있습니다.

## 프로젝트 구조

```txt
src/
  index.ts                         public package exports
  core/                            shared contexts, constants, hooks, OpenLayers helpers
  layers/
    OLSXMap.tsx                    map provider and registry owner
    OLSXVectorLayer/               vector layer compound API and feature bridge
  presets/
    BaseLayer.tsx                  built-in base-map preset
  controls/                        default React controls
playground/                        local Vite demo
docs/rules/                        AI agent navigation rules
AI_INDEX.md                        AI navigation map
```

## Public API 개요

- `OLSXMap`
- `BaseLayer`
- `Controls`
- `Controls.ZoomButton`
- `Controls.ToggleBaseLayerButton`
- `OLSXVectorLayer`
- `createVectorLayer`
- `useMapContext`
- `useToggleBaseLayerType`
- `BaseLayerType`
- `src/core/constants`의 feature 관련 상수

외부 사용자는 가능하면 package root에서 import하는 방식을 권장합니다.

```tsx
import { BaseLayer, OLSXMap, OLSXVectorLayer } from "olx";
```

## 개발 방법

```sh
npm install
npm run dev
```

`playground/`는 로컬 수동 검증용 Vite 데모입니다.

## 빌드와 검증

```sh
npm run build
npm run lint
```

현재 `package.json`에는 test script가 없습니다.

## AI 에이전트 작업 참고 문서

코드를 변경하기 전에는 다음 파일을 먼저 확인합니다.

- `AGENTS.md`
- `AI_INDEX.md`
- `docs/rules/context-navigation.md`

AI navigation metadata를 수정하는 작업이라면 다음 파일도 확인합니다.

- `docs/rules/ai-navigation-maintenance.md`

중요한 source entry point는 다음과 같습니다.

- `src/index.ts`
- `src/layers/OLSXMap.tsx`
- `src/presets/BaseLayer.tsx`
- `src/layers/OLSXVectorLayer/createVectorLayer.ts`
- `src/layers/OLSXVectorLayer/VectorLayer.tsx`

## 현재 한계

- 패키지는 아직 초기 단계이며 private 상태입니다.
- 자동화된 테스트가 아직 설정되어 있지 않습니다.
- 기본 컨트롤 UI는 의도적으로 최소 기능만 제공합니다.
- 기본 base layer preset은 `street`, `satellite`만 제공합니다.
- 고급 OpenLayers 동작은 현재 `useMapContext` 기반 custom component/hook으로 구현하는 것을 권장합니다.
