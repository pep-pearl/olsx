import { forwardRef, useImperativeHandle } from "react";
import { useFeature } from "../internal/useFeature";
import {
  useFeaturePointermove,
  useFeatureSingleclick,
} from "../internal/useFeatureEvent";
import type { OLSXFeatureProps, OLSXFeatureRef } from "../types";

export function OLSXFeatureComp<
  TType extends string = string,
  TData extends object = object,
>(
  {
    id: featureId,
    featureType,
    geometry,
    data,
    onClick,
    onHover,
  }: OLSXFeatureProps<TType, TData>,
  ref: React.ForwardedRef<OLSXFeatureRef>,
) {
  const { featureRef } = useFeature({ featureId, featureType, geometry, data });

  useFeatureSingleclick<TData>(featureId, onClick);
  useFeaturePointermove<TData>(featureId, onHover);

  useImperativeHandle(
    ref,
    () => ({
      getFeature: () => featureRef.current,
    }),
    [featureRef],
  );

  return null;
}

export const OLSXFeature = forwardRef(OLSXFeatureComp);
