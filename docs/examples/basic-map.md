<!--
@ai-purpose OLSX의 기본 지도 렌더링과 map ref 접근 예제를 제공한다.
@ai-doc-kind example
@ai-keywords basic map, OLSXMap, BaseLayer, Controls, OLSXMapRef, registry
@ai-related docs/getting-started/quick-start.md, docs/api/map.md
-->

# 기본 지도

가장 간단한 OLSX 지도를 렌더링하는 방법과, `ref`를 통해 내부 OpenLayers 객체에 접근하는 방법을 보여줍니다.

---

## 예제 1: 기본 지도 렌더링

`OLSXMap`, `OLSXMap.View`, `BaseLayer`만으로 동작하는 최소 구성입니다.

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

### 설명

- **`OLSXMap`** — 지도 컨테이너입니다. `style` prop으로 크기를 지정합니다.
- **`OLSXMap.View`** — 초기 중심 좌표(`defaultCenter`)와 줌 레벨(`defaultZoom`)을 설정합니다. 좌표는 `[경도, 위도]` 형식(EPSG:4326)입니다.
- **`BaseLayer`** — 배경 지도 타일 레이어를 추가합니다.
- **`Controls`** — 지도 컨트롤 영역입니다. `BaseLayerToggle`은 배경 지도 전환, `Zoom`은 줌 버튼을 제공합니다.

---

## 예제 2: Map Ref로 OpenLayers 객체 접근

`ref`를 통해 OpenLayers `Map` 인스턴스와 내부 레지스트리에 직접 접근할 수 있습니다.

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

### 설명

- **`OLSXMapRef`** — `ref`에 사용할 타입입니다.
- **`getMap()`** — OpenLayers `Map` 인스턴스를 반환합니다. OLSX가 제공하지 않는 고급 기능이 필요할 때 사용합니다.
- **`getLayerRegistry()`** — 등록된 레이어를 ID로 조회할 수 있는 레지스트리입니다.
- **`getSourceRegistry()`** — 등록된 소스를 ID로 조회할 수 있는 레지스트리입니다.
- **`getListenerRegistry()`** — 등록된 이벤트 리스너를 관리하는 레지스트리입니다.

> [!TIP]
> `ref`는 대부분의 경우 필요하지 않습니다. OLSX 컴포넌트만으로 충분하지 않을 때 escape hatch로 활용하세요.

---

## 관련 문서

- [OLSXMap API](../api/map.md)
- [빠른 시작](../getting-started/quick-start.md)
