import { type FeatureLike } from "ol/Feature";
import type { Geometry } from "ol/geom";
import type VectorLayer from "ol/layer/Vector";
import type { Style } from "ol/style";

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

type VectorStyleResult = Style | Style[] | void;

export type OLSXVectorLayerProps<
  TTypes extends readonly string[] = readonly string[],
> = {
  id: string;
  types?: TTypes;
  style?: (feature: FeatureLike, type?: TTypes[number]) => VectorStyleResult;
  children?: React.ReactNode;
  cacheStyle?: boolean;
};

export type OLSXVectorLayerRef = {
  getVectorLayer: () => VectorLayer | null;
  isVectorLayerReady: boolean;
};
