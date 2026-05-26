/**
 * @ai-purpose Declarative bridge that turns typed data into an id-managed OpenLayers feature group and feature events.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends useFeatures, useFeaturesEvent, FeaturesProps.
 * @ai-used-by OLSXVectorLayer.Features compound component.
 * @ai-keywords Features, FeatureSet, data, getGeometry, getId, onClick, onHover.
 * @ai-notes Feature identity and event data are stored on OpenLayers features by the hooks.
 */

import {
  useFeaturesPointermove,
  useFeaturesSingleclick,
} from "../internal/useFeaturesEvent";
import { useFeatures } from "../internal/useFeatures";
import type { FeaturesProps } from "../types";

export function OLSXFeatures<
  TType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
>({
  id,
  type,
  data,
  getGeometry,
  getId,
  onClick,
  onHover,
}: FeaturesProps<TType, TData>) {
  useFeatures<TType, TData>({
    id,
    data,
    getGeometry,
    getId,
    type,
  });
  useFeaturesSingleclick<TType, TData>(id, type, onClick);
  useFeaturesPointermove<TType, TData>(id, type, onHover);

  return null;
}
