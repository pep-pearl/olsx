/**
 * @ai-purpose Public package entry point for the React + OpenLayers module API.
 * @ai-entry true
 * @ai-domain public-api
 * @ai-depends controls, core contexts/types/hooks, map provider, vector layer compound API, base layer preset.
 * @ai-used-by Package consumers and playground examples importing from the library root.
 * @ai-keywords OLSXMap, BaseLayer, Controls, OLSXVectorLayer, createVectorLayer, useMapContext, useMapRefsContext, useMapReadyContext.
 * @ai-notes Keep root exports stable; prefer adding internal exports from feature barrels before exposing them here.
 */

export * from "./controls";
export * from "./core/constants";
export {
  useMapContext,
  useMapReadyContext,
  useMapRefsContext,
} from "./core/model/context";
export * from "./core/types";
export * from "./layers/olsx-map";
export * from "./layers/olsx-tile-layer";
export * from "./layers/olsx-vector-layer";
export * from "./olsx-overlay";
export * from "./presets/base-layer";
