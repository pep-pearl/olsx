/**
 * @ai-purpose Default base-map preset that mounts and toggles street/satellite tile layers.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends OLSXMap base-layer context, createBaseSource, OpenLayers TileLayer.
 * @ai-used-by Package consumers that want the built-in base layer behavior.
 * @ai-keywords BaseLayer, BaseLayerRef, street, satellite, createBaseSource, base layer.
 * @ai-notes Keep this as a replaceable preset; advanced users may implement their own base layer component.
 */

import { forwardRef, useImperativeHandle } from "react";
import type { BaseLayerType } from "../../../core/types";
import { useBaseLayer } from "../hooks/useBaseLayer";

export type BaseLayerRef = {
  isBaseLayerReady: boolean;
  toggle: () => void;
};

type BaseLayerProps = {
  defaultType?: BaseLayerType;
};

export const BaseLayer = forwardRef<BaseLayerRef, BaseLayerProps>(
  ({ defaultType = "street" }, ref) => {
    const { isBaseLayerReady, toggleBaseLayerType } = useBaseLayer(defaultType);

    useImperativeHandle(
      ref,
      () => ({
        isBaseLayerReady,
        toggle: toggleBaseLayerType,
      }),
      [isBaseLayerReady, toggleBaseLayerType],
    );

    return null;
  },
);
