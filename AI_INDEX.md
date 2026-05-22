# AI Index

## Purpose

This file is a navigation map for AI agents.

Use it to decide which files to read before opening large parts of the repository. It is not a full architecture document or task prompt.

## How To Use This Index

1. If exact files are provided, start from those files.
2. For public API questions, start at `src/index.ts`, then follow the exported module.
3. For map lifecycle or registry questions, start at `src/layers/OLSXMap.tsx` and `src/core/context.ts`.
4. For vector feature/data/event questions, start at `src/layers/OLSXVectorLayer/VectorLayer.tsx`, then `FeatureSet.tsx` and the hooks under `src/layers/OLSXVectorLayer/hooks/`.
5. Check file-level `@ai-*` comments before opening full files when available.
6. Do not scan all of `src/` by default unless the task explicitly calls for structure-wide maintenance.

## Project Shape

- `src/index.ts` is the package root barrel. Keep public exports stable.
- `src/layers/OLSXMap.tsx` creates the OpenLayers `Map`, owns shared registries, and provides React contexts.
- `src/presets/BaseLayer.tsx` is the built-in replaceable base-map preset for street/satellite tile layers.
- `src/controls/` contains default UI controls that consume map/base-layer contexts.
- `src/layers/OLSXVectorLayer/` contains the vector layer compound API, source mounting, feature-set data bridge, feature events, and vector-specific types.
- `src/core/` contains shared context, constants, base source creation, OpenLayers helpers, and small React/OpenLayers hooks.
- `playground/` is the Vite demo app used for local manual validation.

## Read First By Task

### Public API / Exports

- `src/index.ts`
- `src/layers/OLSXVectorLayer/index.ts`
- `src/layers/OLSXVectorLayer/createVectorLayer.ts`

### Map Provider / Lifecycle

- `src/layers/OLSXMap.tsx`
- `src/core/context.ts`
- `src/core/types.ts`

### Base Layers

- `src/presets/BaseLayer.tsx`
- `src/core/createBaseLayer.ts`
- `src/controls/ToggleBaseLayerButton.tsx`

### Vector Layers / Features / GIS Events

- `src/layers/OLSXVectorLayer/VectorLayer.tsx`
- `src/layers/OLSXVectorLayer/VectorSource.tsx`
- `src/layers/OLSXVectorLayer/FeatureSet.tsx`
- `src/layers/OLSXVectorLayer/hooks/useFeatureSetFeatures.ts`
- `src/layers/OLSXVectorLayer/hooks/useFeatureSetFeatureEvent.ts`
- `src/layers/OLSXVectorLayer/types.ts`

### Default Controls

- `src/controls/Controls.tsx`
- `src/controls/ZoomButton.tsx`
- `src/controls/ToggleBaseLayerButton.tsx`

### Demo / Usage Examples

- `playground/App.tsx`
- `README.md`

## Navigation Notes

- Public consumers should import from the package root unless they intentionally need internal files.
- `BaseLayer` is a preset, not required for custom OpenLayers users; custom base-layer components can use `useMapContext`.
- `OLSXVectorLayer` is the default compound vector API. `createVectorLayer` returns a typed compound component for user-defined feature types/data.
- OpenLayers object lifecycle is intentionally kept in React components/hooks rather than hidden behind a closed abstraction.
- `AGENTS.md` and `docs/rules/context-navigation.md` define how future agents should choose files.
