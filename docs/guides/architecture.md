<!--
@ai-purpose OLSX의 React component 구조와 OpenLayers lifecycle 경계를 설명한다.
@ai-doc-kind guide
@ai-keywords architecture, OLSXMap, lifecycle, registry, context, map refs, vector source, feature registry, headless hooks
@ai-related AI_INDEX.md, docs/api/map.md, docs/api/vector-layer.md, docs/api/hooks.md
-->

# 아키텍처

## 목표

OLSX가 React composition과 OpenLayers object lifecycle을 어떻게 나누는지 이해합니다.

## 언제 사용할까

map lifecycle, layer lifecycle, feature registry, drawing behavior, public API 문서를 바꾸기 전에 읽습니다.

## 예제 구조

```txt
OLSXMap
  OpenLayers Map 생성
  map refs, readiness, registry 제공

OLSXMap.View
  OpenLayers View 생성
  map에 연결

Layer components
  OpenLayers layer mount
  id 기반 등록

Vector source children
  source 기반 feature, event, drawing, overlay 관리
```

## 설명

OLSX는 OpenLayers를 닫힌 abstraction 뒤에 완전히 숨기지 않습니다. 자주 쓰는 지도 구조는 React component로 선언하고, 고급 사용자는 ref와 registry를 통해 OpenLayers 객체에 직접 접근할 수 있게 합니다.

map provider는 다음 context를 소유합니다.

- map과 view ref
- map readiness
- layer registry
- source registry
- listener registry
- base-layer state

layer component는 이 context를 사용해 OpenLayers object를 mount하고 unmount 시 cleanup합니다. vector-layer child는 vector source와 feature registry 접근을 위해 한 단계 더 좁은 context를 제공합니다.

## 설계 원칙

- public import는 package root에서 시작합니다.
- React component는 선언된 위치에서 OpenLayers lifecycle을 소유합니다.
- registry는 주 API라기보다 escape hatch와 cleanup 도구입니다.
- feature array는 전체 remove/add보다 id 기반 update를 우선합니다.
- default UI와 headless hook은 쌍으로 유지해, 동작을 재작성하지 않고 UI만 교체할 수 있게 합니다.

## 절충점

- OpenLayers object를 노출하면 고급 사용이 가능하지만, 그 경로에서는 projected coordinate와 OpenLayers API를 이해해야 합니다.
- compound component는 일반 구조를 읽기 쉽게 하지만, child를 올바른 parent context 아래에 배치해야 합니다.
- ref와 ready state를 나누면 불필요한 구독을 줄일 수 있지만, 고급 사용자는 상황에 맞는 hook을 선택해야 합니다.

## 관련 문서

- [OLSXMap](../api/map.md)
- [OLSXVectorLayer](../api/vector-layer.md)
- [Hooks](../api/hooks.md)
- [AI 내비게이션](../../AI_INDEX.md)
