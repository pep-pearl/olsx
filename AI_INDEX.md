# AI Index

## Purpose

This file is a navigation map for AI agents.

Use it to decide which files to read before opening large parts of the repository. It is not a full architecture document or task prompt.

## How To Use This Index

1. If exact files are provided, start from those files.
2. For public API questions, start at `src/index.ts`, then follow the exported module.
3. For map lifecycle or registry questions, start at `src/olsx-map/components/OLSXMap.tsx`, `src/olsx-map/components/OLSXView.tsx`, `src/olsx-map/internal/useOLSXMap.ts`, `src/olsx-map/internal/mapLifecycle.ts`, `src/core/listeners/listenerRegistry.ts`, and `src/core/model/context.ts`.
4. For reusable layer lifecycle questions, start at `src/core/hooks/useMountLayer.ts` and `src/core/internal/layerLifecycle.ts`.
5. For vector feature/data/event questions, start at the public components under `src/layers/olsx-vector-layer/components/`, then read implementation hooks under `src/layers/olsx-vector-layer/internal/` only as needed. `src/layers/olsx-vector-layer/internal/featuresDiff.ts` owns data diff/upsert behavior.
6. Check file-level `@ai-*` comments before opening full files when available.
7. Do not scan all of `src/` by default unless the task explicitly calls for structure-wide maintenance.

## Project Shape

- `src/index.ts` is the package root barrel. Keep public exports stable.
- `src/core/model/` contains shared React contexts for map refs, map readiness, and base-layer state.
- `src/core/hooks/` contains shared React/OpenLayers lifecycle hooks such as `useMountLayer`.
- `src/core/internal/` contains reusable lifecycle helpers for hooks that need focused tests.
- `src/core/listeners/` contains the map listener registry used by map-level feature events.
- `src/core/utils/` contains OpenLayers helpers and source factories.
- `src/olsx-map/` creates the OpenLayers `Map` and `View`, owns shared registries, and provides React contexts. Public map components live in `components/`; map implementation hooks live in `internal/`.
- `src/layers/olsx-tile-layer/` provides the generic tile-layer component built on the shared layer-mount hook.
- `src/layers/olsx-vector-layer/` contains the vector layer compound API. Public JSX components live in `components/`, implementation hooks/context live in `internal/`, the typed layer factory lives in `factory/`, and the per-source feature registry contract lives in `registry/`.
- `src/olsx-overlay/` contains the React portal wrapper for OpenLayers overlays.
- `src/presets/base-layer/` is the built-in replaceable base-map preset for street/satellite tile layers.
- `src/controls/` contains default UI controls and headless control hooks. Default components live in `default/`; custom UI hooks live in `headless/`. The global CSS preset is located at `src/styles.css`.
- `src/layers/olsx-vector-layer/draw/` contains shared drawing primitives for measurement presets. Public drawing types live in `draw/types.ts`; pure measurement/history/manual-sketch helpers live under `draw/internal/`.
- `docs/getting-started/`, `docs/api/`, `docs/guides/`, and `docs/examples/` contain the official public documentation. `README.md` is the documentation entrypoint. Public docs are Korean-first and include hidden `@ai-purpose`, `@ai-doc-kind`, `@ai-keywords`, and `@ai-related` comments for AI routing.
- `playground/` is the Vite demo app used for local manual validation.

## Read First By Task

### Public API / Exports

- `src/index.ts`
- `src/olsx-map/index.ts`
- `src/layers/olsx-tile-layer/index.ts`
- `src/layers/olsx-vector-layer/index.ts`
- `src/layers/olsx-vector-layer/factory/createVectorLayer.ts`
- `src/olsx-overlay/index.ts`

### Map Provider / Lifecycle

- `src/olsx-map/components/OLSXMap.tsx`
- `src/olsx-map/components/OLSXView.tsx`
- `src/olsx-map/internal/useOLSXMap.ts`
- `src/olsx-map/internal/mapLifecycle.ts`
- `src/core/model/context.ts`
- `src/core/hooks/useMountLayer.ts`
- `src/core/internal/layerLifecycle.ts`
- `src/core/listeners/listenerRegistry.ts`
- `src/olsx-map/types.ts`

### Base Layers

- `src/presets/base-layer/components/BaseLayer.tsx`
- `src/presets/base-layer/hooks/useBaseLayer.ts`
- `src/presets/base-layer/internal/baseLayerLifecycle.ts`
- `src/core/utils/createBaseLayer.ts`
- `src/controls/default/BaseLayerToggle.tsx`
- `src/controls/headless/useBaseLayerControl.ts`

### Tile Layers

- `src/layers/olsx-tile-layer/components/OLSXTileLayer.tsx`
- `src/layers/olsx-tile-layer/types.ts`
- `src/core/hooks/useMountLayer.ts`

### Vector Layers / Features / GIS Events

- `src/layers/olsx-vector-layer/components/OLSXVectorLayer.tsx`
- `src/layers/olsx-vector-layer/components/OLSXVectorSource.tsx`
- `src/layers/olsx-vector-layer/components/OLSXFeature.tsx`
- `src/layers/olsx-vector-layer/components/OLSXFeatures.tsx`
- `src/layers/olsx-vector-layer/components/OLSXDraw.tsx`
- `src/layers/olsx-vector-layer/components/OLSXDrawTooltip.tsx`
- `src/layers/olsx-vector-layer/components/OLSXDistanceDraw.tsx`
- `src/layers/olsx-vector-layer/components/OLSXAreaDraw.tsx`
- `src/layers/olsx-vector-layer/components/OLSXCircleDraw.tsx`
- `src/layers/olsx-vector-layer/components/drawingPresetStyles.ts`
- `src/layers/olsx-vector-layer/draw/types.ts`
- `src/layers/olsx-vector-layer/draw/internal/measurement.ts`
- `src/layers/olsx-vector-layer/draw/internal/drawingHistory.ts`
- `src/layers/olsx-vector-layer/draw/internal/drawingCommandBus.ts`
- `src/layers/olsx-vector-layer/draw/internal/manualDrawing.ts`
- `src/layers/olsx-vector-layer/headless/useDrawControl.ts`
- `src/layers/olsx-vector-layer/headless/useDrawingHistory.ts`
- `src/layers/olsx-vector-layer/internal/useOLSXVectorLayer.ts`
- `src/layers/olsx-vector-layer/internal/useFeature.ts`
- `src/layers/olsx-vector-layer/internal/useFeatureEvent.ts`
- `src/layers/olsx-vector-layer/internal/useFeatures.ts`
- `src/layers/olsx-vector-layer/internal/useFeaturesEvent.ts`
- `src/layers/olsx-vector-layer/internal/featuresDiff.ts`
- `src/layers/olsx-vector-layer/internal/vectorSourceLifecycle.ts`
- `src/layers/olsx-vector-layer/internal/vectorLayerContext.ts`
- `src/layers/olsx-vector-layer/registry/featuresRegistry.ts`
- `src/layers/olsx-vector-layer/factory/createVectorLayer.ts`
- `src/layers/olsx-vector-layer/types.ts`

### Overlays / Popups

- `src/olsx-overlay/components/OLSXOverlay.tsx`
- `src/olsx-overlay/internal/overlayPosition.ts`
- `src/olsx-overlay/types.ts`
- `playground/App.tsx`

### Controls

- `src/controls/default/Controls.tsx`
- `src/controls/default/ZoomControl.tsx`
- `src/controls/default/BaseLayerToggle.tsx`
- `src/controls/default/DrawingToolbar.tsx`
- `src/controls/default/icons.tsx`
- `src/styles.css`
- `src/controls/headless/useZoomControl.ts`
- `src/controls/headless/useBaseLayerControl.ts`
- `src/controls/headless/useDrawingControls.ts`

### Demo / Usage Examples

- `playground/App.tsx`
- `README.md`
- `docs/getting-started/quick-start.md`
- `docs/api/`
- `docs/guides/`
- `docs/examples/`

### Documentation Lookup

- `README.md` — human and AI entrypoint for installation, quick start, docs, examples, and development commands.
- `docs/getting-started/` — installation, quick start, and migration notes.
- `docs/api/` — component and hook reference docs. Search `@ai-doc-kind api-reference`.
- `docs/guides/` — workflow and trade-off guides. Search `@ai-doc-kind guide`.
- `docs/examples/` — copy-pasteable examples. Search `@ai-doc-kind example`.
- `docs/internal/` — internal QA or regression notes linked by guides when relevant.
- For AI routing, prefer `@ai-keywords` over broad source scans when the task is documentation-only.

## Navigation Notes

- Public consumers should import from the package root unless they intentionally need internal files.
- Map refs and map readiness are split into `MapRefsContext` and `MapReadyContext` so hooks can subscribe only to the part they need.
- `useMapRefsContext` is the preferred escape hatch for direct OpenLayers object access; it also exposes `listenerRegistryRef` for id-based map listener cleanup. `useMapContext` remains as a compatibility hook that combines refs and readiness.
- `useMountLayer` is the shared lifecycle hook for OpenLayers layer components and delegates add/remove/registry cleanup to `src/core/internal/layerLifecycle.ts`; check it before adding another layer wrapper.
- `OLSXTileLayer` is the generic public tile-layer wrapper. `BaseLayer` remains the opinionated street/satellite preset.
- Controls are split between `src/controls/default/` ready-to-use UI and `src/controls/headless/` hooks for custom UI.
- Drawing controls follow that same split: `DrawingToolbar` is the default button UI, while `useDrawingControls` owns mode/cancel/undo/redo/clear command wiring for custom toolbars. If callbacks are omitted, it dispatches through `draw/internal/drawingCommandBus.ts` to mounted measurement presets.
- `OLSXVectorLayer` is the default compound vector API. `createVectorLayer` returns a typed compound component for user-defined feature types/data.
- `Features` uses id-based diff/upsert in `featuresDiff.ts` so data changes add, remove, or update only the affected OpenLayers features.
- Feature click/hover handlers register map events through `src/core/listeners/listenerRegistry.ts` rather than directly attaching unmanaged feature-local listeners.
- `OLSXVectorLayer.Draw` accepts `id` and `active`; event listener keys use `buildDrawListenerKey(drawId, eventType)`. `OLSXVectorLayer.Draw.Tooltip` follows the pointer during active drawing. `useDrawControl` is the headless hook for custom draw-state UI inside a Draw subtree.
- `OLSXVectorLayer.Draw.Distance`, `Draw.Area`, and `Draw.Circle` are the default measurement presets. They manage measurement sketch/completed features directly so right-click completion, dots, popups, delete, and undo/redo share one drawing id and stay separate from generic OpenLayers `Draw` interaction lifecycle.
- Measurement drawing presets should reuse `draw/internal/measurement.ts`, `draw/internal/drawingHistory.ts`, `draw/internal/drawingCommandBus.ts`, `draw/internal/manualDrawing.ts`, and `useDrawingHistory` instead of duplicating distance/area/circle completion, source sync, toolbar command dispatch, and undo/redo bookkeeping.
- `OLSXOverlay` mounts React children into an OpenLayers `Overlay` via a React portal; use it for popups, labels, callouts, and map-anchored UI.
- OpenLayers object lifecycle is intentionally kept in React components/hooks rather than hidden behind a closed abstraction.
- `AGENTS.md` and `docs/rules/context-navigation.md` define how future agents should choose files.

## Documentation discovery:

1. docs/api/\*
2. docs/guides/\*
3. docs/examples/\*
4. @ai-keywords
5. source
