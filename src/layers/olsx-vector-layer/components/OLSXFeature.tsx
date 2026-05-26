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
    type,
    geometry,
    data,
    onClick,
    onHover,
  }: OLSXFeatureProps<TType, TData>,
  ref: React.ForwardedRef<OLSXFeatureRef>,
) {
  const { featureRef } = useFeature({ featureId, type, geometry, data });

  useFeatureSingleclick<TType, TData>(featureId, type, onClick);
  useFeaturePointermove<TType, TData>(featureId, type, onHover);

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
