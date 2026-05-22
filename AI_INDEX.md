# AI Index

## Purpose

This file is a navigation map for AI agents.

Use it to decide which files to read before opening large parts of the repository. It is not a full architecture document or task prompt.

## How To Use This Index

1. If exact files are provided, start from those files.
2. For public API questions, start at `src/index.ts`, then follow the exported module.
3. For map lifecycle or registry questions, start at `src/layers/olsx-map/OLSXMap.tsx`, `src/layers/olsx-map/useOLSXMap.ts`, and `src/core/model/context.ts`.
4. For vector feature/data/event questions, start at `src/layers/olsx-vector-layer/components/OLSXVectorLayer.tsx`, then `components/FeatureSet.tsx` and the hooks under `src/layers/olsx-vector-layer/hooks/`.
5. Check file-level `@ai-*` comments before opening full files when available.
6. Do not scan all of `src/` by default unless the task explicitly calls for structure-wide maintenance.

## Project Shape

- `src/index.ts` is the package root barrel. Keep public exports stable.
- `src/layers/olsx-map/` creates the OpenLayers `Map`, owns shared registries, and provides React contexts.
- `src/presets/base-layer/` is the built-in replaceable base-map preset for street/satellite tile layers.
- `src/controls/` contains default UI controls that consume map/base-layer contexts.
- `src/layers/olsx-vector-layer/` contains the vector layer compound API, source mounting, feature-set data bridge, feature events, and vector-specific types.
- `src/core/` contains shared context, constants, base source creation, OpenLayers helpers, and small React/OpenLayers hooks.
- `playground/` is the Vite demo app used for local manual validation.

## Read First By Task

### Public API / Exports

- `src/index.ts`
- `src/layers/olsx-vector-layer/index.ts`
- `src/layers/olsx-vector-layer/utils/createVectorLayer.ts`

### Map Provider / Lifecycle

- `src/layers/olsx-map/OLSXMap.tsx`
- `src/layers/olsx-map/useOLSXMap.ts`
- `src/core/model/context.ts`
- `src/core/types.ts`

### Base Layers

- `src/presets/base-layer/components/BaseLayer.tsx`
- `src/presets/base-layer/hooks/useBaseLayer.ts`
- `src/core/utils/createBaseLayer.ts`
- `src/controls/components/ToggleBaseLayerButton.tsx`

### Vector Layers / Features / GIS Events

- `src/layers/olsx-vector-layer/components/OLSXVectorLayer.tsx`
- `src/layers/olsx-vector-layer/components/VectorSource.tsx`
- `src/layers/olsx-vector-layer/components/FeatureSet.tsx`
- `src/layers/olsx-vector-layer/hooks/useOLSXVectorLayer.ts`
- `src/layers/olsx-vector-layer/hooks/useFeatureSetFeatures.ts`
- `src/layers/olsx-vector-layer/hooks/useFeatureSetFeatureEvent.ts`
- `src/layers/olsx-vector-layer/types.ts`

### Default Controls

- `src/controls/components/Controls.tsx`
- `src/controls/components/ZoomButton.tsx`
- `src/controls/components/ToggleBaseLayerButton.tsx`

### Demo / Usage Examples

- `playground/App.tsx`
- `README.md`

## Navigation Notes

- Public consumers should import from the package root unless they intentionally need internal files.
- `BaseLayer` is a preset, not required for custom OpenLayers users; custom base-layer components can use `useMapRefsContext` or the compatibility `useMapContext`.
- Map refs and map readiness are split into `MapRefsContext` and `MapReadyContext` so hooks can subscribe only to the part they need.
- `OLSXVectorLayer` is the default compound vector API. `createVectorLayer` returns a typed compound component for user-defined feature types/data.
- OpenLayers object lifecycle is intentionally kept in React components/hooks rather than hidden behind a closed abstraction.
- `AGENTS.md` and `docs/rules/context-navigation.md` define how future agents should choose files.
