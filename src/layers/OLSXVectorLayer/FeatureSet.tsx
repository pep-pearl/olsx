/**
 * @ai-purpose Declarative bridge that turns typed data into OpenLayers features and feature events.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends useFeatureSetFeatures, useFeatureSetFeatureEvent, FeatureSetProps.
 * @ai-used-by OLSXVectorLayer.FeatureSet compound component.
 * @ai-keywords FeatureSet, data, getGeometry, getId, onClick, onHover.
 * @ai-notes Feature identity and event data are stored on OpenLayers features by the hooks.
 */

import {
  useFeatureSetFeaturePointermove,
  useFeatureSetFeatureSingleclick,
} from "./hooks/useFeatureSetFeatureEvent";
import { useFeatureSetFeatures } from "./hooks/useFeatureSetFeatures";
import type { FeatureSetProps } from "./types";

export function FeatureSet<
  TType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
>({
  type,
  data,
  getGeometry,
  getId,
  onClick,
  onHover,
}: FeatureSetProps<TType, TData>) {
  useFeatureSetFeatures<TType, TData>({
    data,
    getGeometry,
    getId,
    type,
  });
  useFeatureSetFeatureSingleclick<TType, TData>(type, onClick);
  useFeatureSetFeaturePointermove<TType, TData>(type, onHover);

  return null;
}
