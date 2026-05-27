<!--
@ai-purpose drawing measurement 회귀 원인, 자동 테스트 범위, 수동 QA 체크리스트를 기록한다.
@ai-doc-kind internal-qa
@ai-keywords drawing measurement QA, white screen, overlay cleanup, right click completion, distance, area, circle, regression tests
@ai-related docs/guides/drawing.md, docs/examples/measurement.md
-->

# Drawing Measurement QA 노트

## 원인 분석

### 흰 화면 발생 경로

1. 거리 측정은 OpenLayers `Draw` interaction을 사용하고 있었습니다.
2. sketch가 활성화된 상태에서 우클릭이 map viewport까지 전달되었습니다.
3. viewport의 `contextmenu` handler가 `preventDefault()`를 호출한 뒤 `draw.finishDrawing()`을 호출했습니다.
4. OpenLayers도 해당 우클릭 주변의 pointer event를 처리했습니다. 기본 draw condition은 mouse button 기준이 아니라 modifier 기준이므로, secondary-button pointerup이 `finishDrawing()` 전에 sketch에 영향을 줄 수 있었습니다.
5. `drawend`가 완료된 feature를 React state에 저장했고, 이 state가 `OLSXOverlay`를 통해 React portal popup을 렌더링했습니다.
6. overlay cleanup이 React가 아직 portal child를 소유한 상태에서 portal container element를 직접 비우고 제거했습니다.
7. 반복 finish/delete/unmount cleanup 중 React와 OpenLayers가 같은 DOM 계열을 동시에 detach하려 하면서 다음 오류가 발생할 수 있었습니다.

```text
NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
```

### DOM / Overlay 소유권 문제

`OLSXOverlay`는 하나의 container element를 만들고 그 element를 OpenLayers `Overlay`에 넘깁니다.
React는 container 안에 렌더링되는 portal child를 소유합니다.
OpenLayers는 overlay 등록, 위치 조정, viewport 삽입을 소유합니다.

문제가 된 cleanup은 다음 흐름이었습니다.

```ts
element.replaceChildren();
overlay.setPosition(undefined);
overlay.setElement(undefined);
map.removeOverlay(overlay);
element.remove();
```

수정 후 경계는 다음과 같습니다.

- React는 portal child reconciliation을 소유합니다.
- OpenLayers는 overlay 등록과 위치 조정을 소유합니다.
- cleanup은 React가 소유한 portal child나 portal container를 직접 제거하지 않고 OpenLayers overlay 연결만 해제합니다.
- cleanup은 idempotent하게 동작하므로 StrictMode double cleanup과 반복 remove path에서 안전합니다.

### 중복 제거 위험

불안정했던 경로는 다음과 같습니다.

- `OLSXOverlay` cleanup의 `map.removeOverlay()`
- OpenLayers가 overlay element를 detach하게 만드는 `overlay.setElement(undefined)`
- 같은 cleanup에서 직접 호출한 `element.remove()`
- React portal unmount/reconciliation의 child DOM detach
- 우클릭 completion으로 OpenLayers sketch가 끝나는 동시에 drawing preset history 변경으로 popup overlay가 unmount되는 흐름

### 재현 절차

1. playground를 엽니다.
2. Distance drawing을 활성화합니다.
3. 좌클릭으로 sketch를 시작합니다.
4. sketch tooltip 또는 segment label이 보이는 상태에서 우클릭합니다.
5. 수정 전에는 `removeChild` `NotFoundError`와 함께 page가 white-screen 될 수 있었습니다.
6. 우클릭 전에 pointer를 움직인 경우, 마지막 preview coordinate가 아니라 우클릭 event coordinate가 final point로 처리될 수도 있었습니다.

## 구현 참고

- 측정 preset은 sketch feature와 completed feature를 분리합니다.
- sketch feature는 낮은 opacity와 dashed style을 사용합니다.
- completed drawing id는 feature, popup, vertex/center dot, history entry가 공유합니다.
- delete, undo, redo, source synchronization은 array index가 아니라 drawing id 기준으로 동작합니다.
- 우클릭은 항상 browser context menu를 막습니다.
- Distance/Area 우클릭 completion은 contextmenu coordinate나 pointer preview가 아니라 마지막 left-click point를 사용합니다.
- `Draw.Distance`, `Draw.Area`, `Draw.Circle`은 우클릭 completion semantics를 OpenLayers `Draw`에 맡기지 않고 measurement UX를 직접 관리합니다.
- `Draw.Circle`은 하나의 center에서 여러 radius를 만들 수 있도록 center dot을 유지합니다. 각 radius는 독립적인 popup과 delete action을 가집니다.
- Circle 우클릭은 현재 pointer 위치의 preview radius를 완료하지 않고 center 작업을 종료합니다.
- `Controls.DrawingToolbar`의 기본 undo/redo/clear command는 mounted measurement preset history에 연결됩니다.
- Measurement mode는 서로 다른 primary color와 active cursor를 사용합니다.
- Circle radius result는 circle feature, center dot, radius endpoint dot, center-to-endpoint line, endpoint-anchored popup을 함께 가집니다.

## 자동 테스트

실행:

```powershell
npm.cmd test
```

회귀 테스트 범위:

- overlay cleanup은 직접 DOM 제거 없이 여러 번 실행되어도 안전합니다.
- distance completion gate는 두 개 이상의 clicked point를 요구합니다.
- distance completion은 우클릭 coordinate나 pointer preview가 아니라 마지막 left-click point를 사용합니다.
- area completion gate는 세 개 이상의 clicked point를 요구하고 preview polygon을 닫습니다.
- area completion은 우클릭 coordinate나 pointer preview가 아니라 마지막 left-click point를 사용합니다.
- circle preview는 center와 서로 다른 edge coordinate를 요구합니다.
- source sync는 shared drawing id 기준으로 completed feature와 dot attachment를 추가/제거합니다.
- history test는 complete/delete/undo/redo와 새 작업 후 redo stack clearing을 검증합니다.
- command bus test는 DrawingToolbar 기본 undo/redo/clear dispatch와 aggregate enabled state를 검증합니다.

## 수동 QA 체크리스트

### 공통

- playground를 열고 Distance, Area, Circle을 반복 전환합니다.
- console error, page error, unhandled promise rejection이 없는지 확인합니다.
- mode 전환이 click, pointermove, contextmenu, keydown 동작을 중복시키지 않는지 확인합니다.
- ESC가 현재 sketch/tooltip/temp feature만 제거하고 completed result는 유지하는지 확인합니다.
- completed popup에 값과 Delete button이 모두 있는지 확인합니다.
- 오래된 result와 최신 result를 섞어서 삭제하고, 선택한 feature, dot, popup만 사라지는지 확인합니다.
- 완료 후 Ctrl+Z를 눌러 마지막 완료 또는 삭제 action이 undo되는지 확인합니다.
- undo 후 Ctrl+Shift+Z를 눌러 action이 복원되는지 확인합니다.
- result를 삭제하고 undo한 뒤 새 result를 만들면 redo가 이전 삭제를 복원하지 않는지 확인합니다.
- playground route 또는 component를 unmount/remount해도 overlay가 남지 않고 console error가 없는지 확인합니다.

### Distance

- Distance를 활성화하고 한 번 좌클릭합니다.
- 우클릭했을 때 completed feature가 생성되지 않는지 확인합니다.
- Distance에서 두 개 이상의 point를 찍습니다.
- pointer를 다른 위치로 움직인 뒤 우클릭합니다. final line이 우클릭 event 위치나 preview 위치가 아니라 마지막 left-click 위치를 사용하는지 확인합니다.
- completed line, 각 vertex dot, segment label, final popup이 유지되는지 확인합니다.
- drawing 중 Ctrl+Z를 눌렀을 때 마지막 point만 제거되는지 확인합니다.

### Circle

- Circle을 활성화하고 center를 클릭합니다.
- mouse를 움직였을 때 center dot, temporary circle, radius tooltip이 보이는지 확인합니다.
- 좌클릭으로 radius 하나를 완료합니다. completed circle과 popup이 남고 같은 center가 계속 활성인지 확인합니다.
- completed radius에 endpoint dot, center-to-endpoint line, endpoint에 anchor된 popup이 보이는지 확인합니다.
- 다시 움직이고 좌클릭해 두 번째 독립 radius popup/delete button이 만들어지는지 확인합니다.
- active preview 상태에서 우클릭하면 현재 preview radius가 새 결과로 추가되지 않고 center sketch만 종료되는지 확인합니다.
- center/radius sketch 중 ESC를 누르면 active sketch만 제거되는지 확인합니다.

### Area

- Area를 활성화하고 한 번 클릭합니다. area value가 표시되지 않는지 확인합니다.
- 두 번 클릭합니다. area value가 표시되지 않는지 확인합니다.
- 세 번째 point 이후 mouse를 움직이면 area tooltip이 나타나는지 확인합니다.
- 세 개 미만의 clicked point에서 우클릭하면 drawing이 cancel되는지 확인합니다.
- 세 개 이상의 clicked point에서 우클릭하면 completed polygon과 area popup이 유지되는지 확인합니다.
- 세 개 이상의 clicked point에서 pointer를 다른 위치로 움직인 뒤 우클릭합니다. completed polygon이 preview 위치가 아니라 마지막 left-click 위치까지 닫히는지 확인합니다.

### DrawingToolbar

- Distance, Area, Circle 결과를 각각 하나 이상 만든 뒤 Clear drawings button을 클릭합니다.
- completed feature, dot/line attachment, popup, active sketch가 모두 제거되는지 확인합니다.
- 결과를 만든 뒤 Undo button이 활성화되고 마지막 작업이 제거되는지 확인합니다.
- Undo 후 Redo button이 활성화되고 제거된 작업이 복구되는지 확인합니다.
