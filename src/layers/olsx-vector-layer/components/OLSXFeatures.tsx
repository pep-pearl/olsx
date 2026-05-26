/**
 * @ai-purpose Declarative bridge that turns typed data into an id-managed OpenLayers feature group and feature events.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends useFeatures, useFeaturesEvent, FeaturesProps.
 * @ai-used-by OLSXVectorLayer.Features compound component.
 * @ai-keywords Features, data, getGeometry, getId, onClick, onHover.
 * @ai-notes Feature identity and event data are stored on OpenLayers features by the hooks.
 */

import { useImperativeHandle } from "react";
import { useFeatures } from "../internal/useFeatures";
import {
  useFeaturesPointermove,
  useFeaturesSingleclick,
} from "../internal/useFeaturesEvent";
import type { OLSXFeaturesProps } from "../types";

export function OLSXFeatures<
  TType extends string = string,
  TData extends object = object,
>(
  {
    id,
    featureType,
    data,
    getGeometry,
    getId,
    onClick,
    onHover,
  }: OLSXFeaturesProps<TType, TData>,
  ref: React.ForwardedRef<any>,
) {
  const { featuresByIdRef } = useFeatures<TType, TData>({
    id,
    data,
    getGeometry,
    getId,
    featureType,
  });

  useFeaturesSingleclick<TType, TData>(id, featureType, onClick);
  useFeaturesPointermove<TType, TData>(id, featureType, onHover);

  useImperativeHandle(
    ref,
    () => ({
      getFeatures: () => [...featuresByIdRef.current.values()],
    }),
    [featuresByIdRef],
  );

  return null;
}
