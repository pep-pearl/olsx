import { type FeatureLike } from "ol/Feature";
import type { Geometry } from "ol/geom";

export type FeatureSetProps<
  TType extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
> = {
  type: TType;
  getId: (item: TData) => string;
  getGeometry: (item: TData) => Geometry;
  data: Array<TData>;
  onClick?: (item: TData, feature: FeatureLike) => void;
  onHover?: (item: TData, feature: FeatureLike) => void;
};
