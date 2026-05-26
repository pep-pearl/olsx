# OLSX

OLSX는 React에서 OpenLayers 지도를 선언적으로 구성하기 위한 초기 단계의 모듈입니다.

OpenLayers를 완전히 숨기는 블랙박스 래퍼가 아니라, 자주 쓰는 지도 구성은 React 컴포넌트로 제공하고 더 깊은 제어가 필요한 곳에서는 OpenLayers 객체와 registry에 직접 접근할 수 있게 하는 것을 목표로 합니다.

## 대상 사용자

- OpenLayers 중심 사용자: 지도 객체, layer, source를 직접 다룰 수 있으면서 React 생명주기와 기본 UI 연결을 얻고 싶은 사용자.
- React 중심 사용자: OpenLayers 세부 구현을 깊게 몰라도 타입이 잡힌 컴포넌트와 예제로 빠르게 지도를 붙이고 싶은 사용자.

## 주요 기능

- `OLSXMap`: OpenLayers `Map` 인스턴스와 공통 registry를 소유하는 provider.
- `OLSXMap.View`: OpenLayers `View`를 별도 컴포넌트로 선언하고 `map.setView()`에 연결.
- `useMapRefsContext()`: `mapRef`, `viewRef`, `layerRegistryRef`, `sourceRegistryRef` 접근.
- `useMapReadyContext()`: 지도 준비 상태만 구독.
- `useMapContext()`: refs와 ready 상태를 함께 제공하는 호환 hook.
- `BaseLayer`: street/satellite 기본 배경지도 preset.
- `Controls`: zoom, base-layer toggle을 포함한 기본 control compound component.
- `OLSXTileLayer`: 직접 OpenLayers tile source를 넣는 저수준 tile layer wrapper.
- `OLSXOverlay`: React children을 OpenLayers overlay로 렌더링.
- `OLSXVectorLayer`: vector layer, vector source, `Feature`, `Features`를 묶은 compound API.
- `createVectorLayer()`: 도메인별 feature type/data 타입을 고정하는 typed vector layer factory.
- `Layer.Source` ref: `getVectorSource()`와 `getRegistry()`로 해당 vector source와 id 기반 feature registry 접근.

## 설치

패키지로 배포해서 사용할 때는 다음 peer dependency와 함께 설치합니다.

```sh
npm install olsx ol react react-dom
```

이 저장소를 로컬에서 개발할 때는 다음 명령을 사용합니다.

```sh
npm install
npm run dev
```

## 빠른 시작

`OLSXMap`은 지도 컨테이너와 OpenLayers `Map`을 만들고, `OLSXMap.View`가 실제 `View`를 생성해서 지도에 붙입니다.

```tsx
import { BaseLayer, Controls, OLSXMap } from "olsx";

export function BasicMap() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={16} />

      <BaseLayer />

      <Controls>
        <Controls.ToggleBaseLayerButton />
        <Controls.ZoomButton />
      </Controls>
    </OLSXMap>
  );
}
```

`OLSXMap.View`를 생략하면 `Map`은 생성되지만 view는 자동으로 설정되지 않습니다. 기본값을 쓰려면 `<OLSXMap.View />`만 렌더링하면 됩니다.

## View 제어

`OLSXMap.View`는 별도 ref를 제공합니다. 지도 전체 ref에서도 현재 view에 접근할 수 있습니다.

```tsx
import { useRef } from "react";
import { OLSXMap, type OLSXMapRef, type OLSXViewRef } from "olsx";

export function MapWithRefs() {
  const mapRef = useRef<OLSXMapRef>(null);
  const viewRef = useRef<OLSXViewRef>(null);

  return (
    <OLSXMap ref={mapRef} style={{ width: "100%", height: 480 }}>
      <OLSXMap.View
        ref={viewRef}
        defaultCenter={[126.978, 37.5665]}
        defaultZoom={14}
      />

      <button
        type="button"
        onClick={() => {
          const view = viewRef.current?.getView() ?? mapRef.current?.getView();
          view?.animate({ zoom: 17, duration: 250 });
        }}
      >
        Zoom in
      </button>
    </OLSXMap>
  );
}
```

## Tile Layer

`OLSXTileLayer`는 OpenLayers source를 직접 넘기는 단순한 wrapper입니다. 기본 배경지도 preset이 아니라 특정 tile source를 직접 제어할 때 사용합니다.

```tsx
import XYZ from "ol/source/XYZ";
import { OLSXMap, OLSXTileLayer } from "olsx";

export function ImageryMap() {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View />

      <OLSXTileLayer
        id="imagery"
        source={
          new XYZ({
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          })
        }
      />
    </OLSXMap>
  );
}
```

## Overlay

`OLSXOverlay`는 React children을 OpenLayers `Overlay`에 portal로 붙입니다. 팝업, 라벨, callout에 사용할 수 있습니다.

```tsx
import { fromLonLat } from "ol/proj";
import { useRef } from "react";
import { OLSXMap, OLSXOverlay, type OLSXOverlayRef } from "olsx";

export function PopupMap() {
  const overlayRef = useRef<OLSXOverlayRef>(null);

  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View />

      <OLSXOverlay
        ref={overlayRef}
        id="selected-place"
        coordinate={fromLonLat([126.9784, 37.5666])}
        positioning="bottom-center"
        offset={[0, -16]}
        stopEvent
      >
        <div style={{ background: "white", padding: 12 }}>
          <button type="button" onClick={() => overlayRef.current?.hide()}>
            Close
          </button>
          Seoul City Hall
        </div>
      </OLSXOverlay>
    </OLSXMap>
  );
}
```

## Vector Layer

`OLSXVectorLayer`는 compound component입니다. 기본 흐름은 `Layer -> Source -> Features`입니다.

`Features`는 여러 데이터를 한 번에 OpenLayers `Feature[]`로 만들고, `id`로 feature group을 registry에 등록합니다. 기존 `FeatureSet` 이름은 호환 alias로 남아 있지만 새 코드에서는 `Features`를 권장합니다.

```tsx
import type { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import { BaseLayer, createVectorLayer, OLSXMap } from "olsx";

const placeTypes = ["marker", "selected"] as const;

type Place = {
  id: string;
  name: string;
  lon: number;
  lat: number;
};

const PlaceLayer = createVectorLayer<typeof placeTypes, Place>();

function markerStyle(feature: FeatureLike, type?: (typeof placeTypes)[number]) {
  const place = feature.get("_properties") as Place | undefined;

  return new Style({
    image: new CircleStyle({
      radius: type === "selected" ? 10 : 7,
      fill: new Fill({ color: type === "selected" ? "#f97316" : "#2563eb" }),
      stroke: new Stroke({ color: "#ffffff", width: 3 }),
    }),
    text: new Text({
      text: place?.name ?? "",
      offsetY: -22,
      font: "600 13px sans-serif",
      fill: new Fill({ color: "#111827" }),
      stroke: new Stroke({ color: "#ffffff", width: 4 }),
    }),
  });
}

export function PlacesMap({ places }: { places: Place[] }) {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View />
      <BaseLayer />

      <PlaceLayer id="places" types={placeTypes} style={markerStyle}>
        <PlaceLayer.Source />
        <PlaceLayer.Features
          id="place-markers"
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

## 단일 Feature와 Features

`Layer.Feature`는 단일 OpenLayers `Feature`를 만들고 source registry에 `kind: "feature"`로 등록합니다. `Layer.Features`는 여러 데이터를 `Feature[]`로 만들고 `kind: "features"`로 등록합니다.

```tsx
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { OLSXVectorLayer } from "olsx";

const types = ["marker"] as const;

type Station = {
  id: string;
  lon: number;
  lat: number;
};

const stations: Station[] = [];

export function MixedFeatures() {
  return (
    <OLSXVectorLayer id="places" types={types}>
      <OLSXVectorLayer.Source />

      <OLSXVectorLayer.Feature
        id="city-hall"
        type="marker"
        geometry={new Point(fromLonLat([126.9784, 37.5666]))}
        properties={{ name: "Seoul City Hall" }}
      />

      <OLSXVectorLayer.Features
        id="station-markers"
        type="marker"
        data={stations}
        getId={(item) => item.id}
        getGeometry={(item) => new Point(fromLonLat([item.lon, item.lat]))}
      />
    </OLSXVectorLayer>
  );
}
```

## Vector Source Registry

각 `Layer.Source`는 자기 source에 속한 feature registry를 가지고 있습니다. 이 registry는 전역 `sourceRegistryRef`와 별개로, 해당 vector source 안에서 `Feature`와 `Features`를 id로 찾기 위한 용도입니다.

```tsx
import { useRef } from "react";
import { OLSXMap, OLSXVectorLayer, type OLSXVectorSourceRef } from "olsx";

export function RegistryExample() {
  const sourceRef = useRef<OLSXVectorSourceRef>(null);

  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View />

      <OLSXVectorLayer id="places">
        <OLSXVectorLayer.Source ref={sourceRef} />

        <button
          type="button"
          onClick={() => {
            const registry = sourceRef.current?.getRegistry();
            const entry = registry?.get("place-markers");

            if (entry?.kind === "features") {
              console.log(entry.features);
            }
          }}
        >
          Read registry
        </button>
      </OLSXVectorLayer>
    </OLSXMap>
  );
}
```

Registry entry shape:

```ts
type FeatureRegistryEntry =
  | { kind: "feature"; feature: Feature }
  | { kind: "features"; features: Feature[] };
```

## 확장 지점

직접 OpenLayers를 다뤄야 한다면 다음 API를 사용합니다.

- `useMapRefsContext()`: `mapRef`, `viewRef`, `layerRegistryRef`, `sourceRegistryRef` 접근.
- `useMapReadyContext()`: 지도 준비 상태만 구독.
- `useMapContext()`: refs와 ready 상태를 함께 접근.
- `useMountLayer()`: 새 layer wrapper를 만들 때 layer mount, registry 등록, cleanup을 일관되게 처리.
- `OLSXTileLayer`: source를 직접 넘기는 generic tile layer wrapper.
- `OLSXOverlay`: `coordinate`, `visible`, `positioning`, `offset`, `autoPan`, `stopEvent`로 overlay 동작 제어.
- `createVectorLayer()`: 도메인 feature data 타입에 맞춘 typed compound component 생성.
- `Layer.Source` ref: `getVectorSource()`, `getRegistry()`, `isSourceReady` 제공.

## 프로젝트 구조

```txt
src/
  index.ts                         public package exports
  core/
    model/                         map refs, readiness, base-layer contexts
    hooks/                         shared React/OpenLayers hooks
    utils/                         OpenLayers helpers
    constants.ts                   feature metadata keys
    types.ts                       shared public types
  olsx-map/
    components/                    public JSX components: OLSXMap, OLSXMap.View
    internal/                      map lifecycle implementation hooks
    types.ts                       map/view public ref and prop types
  layers/
    olsx-tile-layer/               generic tile layer wrapper
    olsx-vector-layer/
      components/                  public JSX components: Layer, Source, Feature, Features
      factory/                     public typed vector layer factory
      internal/                    implementation hooks, context, and style cache
      registry/                    per-source feature registry contract
      types.ts                     vector layer and Features public types
  olsx-overlay/                    coordinate-anchored React overlay wrapper
  presets/
    base-layer/                    built-in base-map preset
  controls/                        default React controls and control hooks
playground/                        local Vite demo
docs/rules/                        AI agent navigation rules
AI_INDEX.md                        AI navigation map
```

## Public API

주요 root exports:

- `OLSXMap`
- `OLSXMap.View`
- `OLSXMapRef`
- `OLSXViewRef`
- `OLSXTileLayer`
- `OLSXOverlay`
- `OLSXOverlayRef`
- `BaseLayer`
- `Controls`
- `Controls.ZoomButton`
- `Controls.ToggleBaseLayerButton`
- `OLSXVectorLayer`
- `createVectorLayer`
- `defineOlsxVectorLayer`
- `OLSXVectorSourceRef`
- `OLSXFeatureRef`
- `FeaturesRegistry`
- `useMapRefsContext`
- `useMapReadyContext`
- `useMapContext`
- `BaseLayerType`
- feature metadata constants from `src/core/constants`

외부 사용자는 가능하면 package root에서 import하는 방식을 권장합니다.

```tsx
import {
  BaseLayer,
  Controls,
  createVectorLayer,
  OLSXMap,
  OLSXOverlay,
  OLSXTileLayer,
  OLSXVectorLayer,
} from "olsx";
```

## 개발

```sh
npm install
npm run dev
```

`playground/`는 로컬 수동 검증용 Vite demo입니다.

## 빌드와 검증

```sh
npm run build
npm run lint
```

현재 `package.json`에는 별도 test script가 없습니다.

## AI 에이전트 참고 문서

코드를 변경하기 전에는 다음 파일을 먼저 확인합니다.

- `AGENTS.md`
- `AI_INDEX.md`
- `docs/rules/context-navigation.md`

AI navigation metadata를 수정하는 작업이라면 다음 파일도 확인합니다.

- `docs/rules/ai-navigation-maintenance.md`

중요한 source entry point:

- `src/index.ts`
- `src/core/model/context.ts`
- `src/core/hooks/useMountLayer.ts`
- `src/olsx-map/components/OLSXMap.tsx`
- `src/olsx-map/components/OLSXView.tsx`
- `src/olsx-map/internal/useOLSXMap.ts`
- `src/layers/olsx-tile-layer/components/OLSXTileLayer.tsx`
- `src/olsx-overlay/components/OLSXOverlay.tsx`
- `src/presets/base-layer/components/BaseLayer.tsx`
- `src/layers/olsx-vector-layer/components/OLSXVectorLayer.tsx`
- `src/layers/olsx-vector-layer/components/OLSXVectorSource.tsx`
- `src/layers/olsx-vector-layer/components/OLSXFeature.tsx`
- `src/layers/olsx-vector-layer/components/OLSXFeatures.tsx`
- `src/layers/olsx-vector-layer/registry/featuresRegistry.ts`
- `src/layers/olsx-vector-layer/factory/createVectorLayer.ts`

## 현재 제한

- 패키지는 아직 초기 단계이며 private 상태입니다.
- 자동화된 test script는 아직 없습니다.
- 기본 control UI는 의도적으로 최소 기능만 제공합니다.
- 기본 base layer preset은 현재 `street`, `satellite` 중심입니다.
- 고급 OpenLayers 동작은 `useMapRefsContext`, `useMountLayer`, ref API, 또는 직접 OpenLayers 객체 접근 기반 custom component/hook으로 구현하는 것을 권장합니다.
