# OLSX

OLSX는 React에서 OpenLayers 지도를 선언적으로 구성하기 위한 컴포넌트 라이브러리입니다.

OpenLayers 객체를 완전히 숨기기보다는, 자주 쓰는 지도 구성은 React 컴포넌트로 빠르게 붙이고 깊은 제어가 필요한 곳에서는 ref와 registry로 OpenLayers 객체에 접근할 수 있게 만드는 것을 목표로 합니다.

## 핵심 방향

- OpenLayers를 아는 사용자는 `map`, `view`, `layer`, `source`, `overlay` 객체에 직접 접근할 수 있습니다.
- OpenLayers를 잘 모르는 사용자는 `OLSXMap`, `BaseLayer`, `Controls`, `OLSXVectorLayer`, `OLSXOverlay` 같은 기본 컴포넌트만으로 시작할 수 있습니다.
- 라이프사이클과 registry 처리는 내부 helper로 분리되어 mount/unmount, add/remove, listener cleanup 동작을 일관되게 유지합니다.

## 설치

```sh
npm install olsx ol react react-dom
```

로컬 개발:

```sh
npm install
npm run dev
```

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

`OLSXMap`은 OpenLayers `Map`과 공유 registry를 만들고, `OLSXMap.View`는 OpenLayers `View`를 생성해 `map.setView()`로 연결합니다.

## 주요 API

- `OLSXMap`: OpenLayers `Map` 인스턴스와 공유 registry를 소유하는 provider입니다.
- `OLSXMap.View`: `View`를 별도 컴포넌트로 선언합니다.
- `useMapRefsContext()`: `mapRef`, `viewRef`, `layerRegistryRef`, `sourceRegistryRef`, `listenerRegistryRef`에 접근합니다.
- `useMapReadyContext()`: 지도 ready 상태만 구독합니다.
- `useMapContext()`: refs와 ready 상태를 함께 가져오는 호환 hook입니다.
- `BaseLayer`: street/satellite 기본 배경지도 preset입니다.
- `Controls`: 기본 zoom, base-layer toggle UI를 제공하는 compound component입니다.
- `useZoomControl()`, `useBaseLayerControl()`: 외부 커스텀 UI를 위한 headless control hook입니다.
- `OLSXTileLayer`: 직접 만든 OpenLayers tile source를 붙이는 generic tile layer wrapper입니다.
- `OLSXOverlay`: React children을 OpenLayers `Overlay`에 portal로 렌더링합니다.
- `OLSXVectorLayer`: vector layer, source, single feature, data-driven features, draw interaction을 묶은 compound API입니다.
- `createVectorLayer()`: feature type/data 타입을 고정한 typed vector layer factory입니다.

## Map Ref와 Registry

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

`listenerRegistryRef`는 map-level event listener를 id로 관리합니다. Feature click/hover 이벤트도 feature 내부에서 `map.on/map.un`을 직접 다루지 않고 listener registry에 등록되며, unmount 시 registry cleanup을 통해 해제됩니다.

## Controls

Controls는 기본 UI와 headless hook으로 나뉩니다.

- 기본 UI: `Controls`, `Controls.Zoom`, `Controls.BaseLayerToggle`
- Headless hook: `useZoomControl()`, `useBaseLayerControl()`
- 호환 alias: `Controls.ZoomButton`, `Controls.ToggleBaseLayerButton`, `ZoomButton`, `ToggleBaseLayerButton`

커스텀 UI 예시:

```tsx
import { useBaseLayerControl, useZoomControl } from "olsx";

export function CustomToolbar() {
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
```

## Vector Layer

`OLSXVectorLayer`의 기본 흐름은 `Layer -> Source -> Feature/Features/Draw`입니다.

`Feature`는 단일 OpenLayers `Feature`를 등록하고, `Features`는 data 배열을 id 기반 feature group으로 등록합니다. `Draw`는 해당 source에 도형을 그리는 인터랙션을 추가합니다.

```tsx
import type { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
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
  return new Style({
    image: new CircleStyle({
      radius: type === "selected" ? 10 : 7,
      fill: new Fill({ color: type === "selected" ? "#f97316" : "#2563eb" }),
      stroke: new Stroke({ color: "#ffffff", width: 3 }),
    }),
  });
}

export function PlacesMap({ places }: { places: Place[] }) {
  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={13} />
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

> **참고:** `Feature`나 `Features`에 `onClick` 핸들러가 등록되어 있다면 마우스를 올렸을 때 자동으로 커서가 `pointer`로 변경됩니다. `onHover`를 통해 커스텀 호버 이벤트를 처리할 수도 있습니다.

### Feature Diff Upsert

`Features`는 data가 바뀔 때 전체 feature를 매번 제거하고 다시 추가하지 않습니다.

- `getId(item)` 값을 기준으로 기존 feature를 찾습니다.
- 새 id는 `addFeature`로 추가합니다.
- 사라진 id는 `removeFeature`로 삭제합니다.
- 유지되는 id는 같은 OpenLayers `Feature` 인스턴스의 geometry와 metadata만 업데이트합니다.

이 방식은 대규모 data 업데이트에서 불필요한 remove/add 비용과 event/style churn을 줄입니다.

### Draw Interaction

`Draw` 컴포넌트를 사용하여 지도에 도형(LineString, Polygon, Point 등)을 직접 그릴 수 있습니다.

```tsx
<PlaceLayer id="drawing-layer">
  <PlaceLayer.Source />
  <PlaceLayer.Draw
    id="route-draw"
    active={isDrawingMode}
    type="LineString"
    onDrawStart={(event) => console.log("start", event.feature)}
    onDrawEnd={(event) => console.log("end", event.feature)}
  >
    <PlaceLayer.Draw.Tooltip>Click to keep drawing</PlaceLayer.Draw.Tooltip>
  </PlaceLayer.Draw>
</PlaceLayer>
```

`Draw`는 `active`가 true일 때만 그릴 수 있습니다. interaction은 유지하고 `draw.setActive(active)`만 갱신하므로 toggle 시 source/interaction을 재생성하지 않습니다.

`id`를 넘기면 draw event key는 `draw:{id}:{event}` 형태로 관리됩니다. `id`를 생략하면 내부에서 stable id를 만들어 listener registry에 사용합니다.

`Draw.Tooltip`은 drawing 중에만 보이며 pointer coordinate를 따라가는 overlay입니다. 직접 UI를 만들고 싶다면 `useDrawControl()`을 `Draw` children 아래에서 사용할 수 있습니다.

```tsx
import { useDrawControl } from "olsx";

function DrawStatus() {
  const { id, active, isDrawing, coordinate } = useDrawControl();

  return active && isDrawing ? <div>{id}: {coordinate?.join(", ")}</div> : null;
}
```

## Vector Source Registry

각 `Layer.Source`는 자신에게 붙은 feature registry를 갖습니다. `sourceRegistryRef`는 vector source 자체를 찾기 위한 전역 registry이고, `Layer.Source` ref의 `getRegistry()`는 해당 source 내부의 `Feature`/`Features` group을 id로 찾기 위한 registry입니다.

```tsx
import { useRef } from "react";
import { OLSXMap, OLSXVectorLayer, type OLSXVectorSourceRef } from "olsx";

export function RegistryExample() {
  const sourceRef = useRef<OLSXVectorSourceRef>(null);

  return (
    <OLSXMap style={{ width: "100%", height: 480 }}>
      <OLSXMap.View defaultCenter={[126.978, 37.5665]} defaultZoom={13} />

      <OLSXVectorLayer id="places">
        <OLSXVectorLayer.Source ref={sourceRef} />

        <button
          type="button"
          onClick={() => {
            const entry = sourceRef.current?.getRegistry().get("place-markers");

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

## Overlay

`OLSXOverlay`는 React children을 OpenLayers `Overlay`의 element에 portal로 렌더링합니다. `visible`이 false이거나 `coordinate`가 없으면 `setPosition(undefined)`로 위치를 비웁니다.

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

## 디렉터리 구조

```txt
src/
  index.ts                         public package exports
  core/
    hooks/                         shared React/OpenLayers hooks
    internal/                      reusable lifecycle helpers
    listeners/                     map listener registry
    model/                         map refs, readiness, base-layer contexts
    utils/                         OpenLayers helpers and source factories
  olsx-map/
    components/                    OLSXMap, OLSXMap.View
    internal/                      map lifecycle and map hook
    types.ts                       map/view prop and ref contracts
  layers/
    olsx-tile-layer/               generic tile layer wrapper
    olsx-vector-layer/
      components/                  Layer, Source, Feature, Features JSX API
      factory/                     typed vector layer factory
      internal/                    feature diff, source lifecycle, events, context
      registry/                    per-source feature registry contract
      types.ts                     vector public types
  olsx-overlay/
    components/                    overlay portal component
    internal/                      overlay position synchronization
  presets/
    base-layer/
      components/                  BaseLayer preset component
      hooks/                       React hook for base layer switching
      internal/                    base layer replacement lifecycle
  controls/
    default/                       ready-to-use controls
    headless/                      custom UI hooks
playground/                        local Vite demo
scripts/                           local test helpers
docs/rules/                        AI agent navigation rules
AI_INDEX.md                        AI navigation map
```

## 개발과 검증

```sh
npm run lint
npm test
npm run build
```

`npm test`는 TypeScript 테스트 산출물을 `node_modules/.tmp/test-dist`에 만든 뒤 Node test runner로 실행합니다. 현재 주요 lifecycle 테스트는 다음을 검증합니다.

- `OLSXMap` mount/unmount 시 `map.dispose` 호출
- `useMountLayer`의 add/remove/registry cleanup 로직
- `BaseLayer` toggle 시 기존 base layer 제거
- `VectorLayer.Source` mount 시 source registry 등록과 cleanup
- `Features` data 변경 시 feature 추가/삭제/업데이트
- `Overlay` visible/coordinate 변경 시 position 처리
- map listener registry 등록/해제/전체 정리

## AI navigation 참고

코드를 변경하기 전에는 다음 파일을 우선 확인합니다.

- `AGENTS.md`
- `AI_INDEX.md`
- `docs/rules/context-navigation.md`

AI navigation metadata를 수정하는 작업이거나 map/GIS 구조를 바꾸는 작업이라면 `docs/rules/ai-navigation-maintenance.md`도 확인합니다.
