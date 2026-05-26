# AI Index

## Purpose

This file is a navigation map for AI agents.

Use it to decide which files to read before opening large parts of the repository. It is not a full architecture document or task prompt.

## How To Use This Index

1. If exact files are provided, start from those files.
2. For public API questions, start at `src/index.ts`, then follow the exported module.
3. For map lifecycle or registry questions, start at `src/olsx-map/components/OLSXMap.tsx`, `src/olsx-map/components/OLSXView.tsx`, `src/olsx-map/internal/useOLSXMap.ts`, and `src/core/model/context.ts`.
4. For reusable layer lifecycle questions, start at `src/core/hooks/useMountLayer.ts`.
5. For vector feature/data/event questions, start at the public components under `src/layers/olsx-vector-layer/components/`, then read implementation hooks under `src/layers/olsx-vector-layer/internal/` only as needed.
6. Check file-level `@ai-*` comments before opening full files when available.
7. Do not scan all of `src/` by default unless the task explicitly calls for structure-wide maintenance.

## Project Shape

- `src/index.ts` is the package root barrel. Keep public exports stable.
- `src/core/model/` contains shared React contexts for map refs, map readiness, and base-layer state.
- `src/core/hooks/` contains shared React/OpenLayers lifecycle hooks such as `useMountLayer`.
- `src/core/utils/` contains OpenLayers helpers and source factories.
- `src/olsx-map/` creates the OpenLayers `Map` and `View`, owns shared registries, and provides React contexts. Public map components live in `components/`; map implementation hooks live in `internal/`.
- `src/layers/olsx-tile-layer/` provides the generic tile-layer component built on the shared layer-mount hook.
- `src/layers/olsx-vector-layer/` contains the vector layer compound API. Public JSX components live in `components/`, implementation hooks/context live in `internal/`, the typed layer factory lives in `factory/`, and the per-source feature registry contract lives in `registry/`.
- `src/olsx-overlay/` contains the React portal wrapper for OpenLayers overlays.
- `src/presets/base-layer/` is the built-in replaceable base-map preset for street/satellite tile layers.
- `src/controls/` contains default UI controls that consume map/base-layer contexts.
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
- `src/core/model/context.ts`
- `src/core/hooks/useMountLayer.ts`
- `src/olsx-map/types.ts`

### Base Layers

- `src/presets/base-layer/components/BaseLayer.tsx`
- `src/presets/base-layer/hooks/useBaseLayer.ts`
- `src/core/utils/createBaseLayer.ts`
- `src/controls/components/ToggleBaseLayerButton.tsx`

### Tile Layers

- `src/layers/olsx-tile-layer/components/OLSXTileLayer.tsx`
- `src/layers/olsx-tile-layer/types.ts`
- `src/core/hooks/useMountLayer.ts`

### Vector Layers / Features / GIS Events

- `src/layers/olsx-vector-layer/components/OLSXVectorLayer.tsx`
- `src/layers/olsx-vector-layer/components/OLSXVectorSource.tsx`
- `src/layers/olsx-vector-layer/components/OLSXFeature.tsx`
- `src/layers/olsx-vector-layer/components/OLSXFeatures.tsx`
- `src/layers/olsx-vector-layer/internal/useOLSXVectorLayer.ts`
- `src/layers/olsx-vector-layer/internal/useFeatures.ts`
- `src/layers/olsx-vector-layer/internal/useFeaturesEvent.ts`
- `src/layers/olsx-vector-layer/internal/vectorLayerContext.ts`
- `src/layers/olsx-vector-layer/registry/featuresRegistry.ts`
- `src/layers/olsx-vector-layer/factory/createVectorLayer.ts`
- `src/layers/olsx-vector-layer/types.ts`

### Overlays / Popups

- `src/olsx-overlay/components/OLSXOverlay.tsx`
- `src/olsx-overlay/types.ts`
- `playground/App.tsx`

### Default Controls

- `src/controls/components/Controls.tsx`
- `src/controls/components/ZoomButton.tsx`
- `src/controls/components/ToggleBaseLayerButton.tsx`
- `src/core/hooks/useZoom.ts`
- `src/core/hooks/useToggleBaseLayer.ts`

### Demo / Usage Examples

- `playground/App.tsx`
- `README.md`

## Navigation Notes

- Public consumers should import from the package root unless they intentionally need internal files.
- Map refs and map readiness are split into `MapRefsContext` and `MapReadyContext` so hooks can subscribe only to the part they need.
- `useMapRefsContext` is the preferred escape hatch for direct OpenLayers object access; `useMapContext` remains as a compatibility hook that combines refs and readiness.
- `useMountLayer` is the shared lifecycle helper for OpenLayers layer components; check it before adding another layer wrapper.
- `OLSXTileLayer` is the generic public tile-layer wrapper. `BaseLayer` remains the opinionated street/satellite preset.
- `OLSXVectorLayer` is the default compound vector API. `createVectorLayer` returns a typed compound component for user-defined feature types/data.
- `OLSXOverlay` mounts React children into an OpenLayers `Overlay` via a React portal; use it for popups, labels, callouts, and map-anchored UI.
- OpenLayers object lifecycle is intentionally kept in React components/hooks rather than hidden behind a closed abstraction.
- `AGENTS.md` and `docs/rules/context-navigation.md` define how future agents should choose files.
