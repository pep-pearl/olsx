import type Feature from "ol/Feature";
import { type FeatureLike } from "ol/Feature";
import type { Geometry } from "ol/geom";
import type VectorLayer from "ol/layer/Vector";
import type OlVectorSource from "ol/source/Vector";
import type { Style } from "ol/style";
import type { FeaturesRegistry } from "./registry/featuresRegistry";

export type OLSXFeaturesProps<
  TType extends string = string,
  TData extends object = object,
> = {
  id: string;
  type: TType;
  getId: (item: TData) => string;
  getGeometry: (item: TData) => Geometry;
  data: Array<TData>;
  onClick?: (item: TData, feature: FeatureLike) => void;
  onHover?: (item: TData, feature: FeatureLike) => void;
};

export type OLSXFeaturesRef = { getFeatures: () => Feature[] };

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

export type OLSXFeatureProps<
  TType extends string = string,
  TData extends object = object,
> = {
  id: string;
  type?: TType;
  geometry?: Geometry;
  data: TData;
  onClick?: (item: TData, feature: FeatureLike) => void;
  onHover?: (item: TData, feature: FeatureLike) => void;
};

export type OLSXFeatureRef = {
  getFeature: () => Feature | null;
};

export type OLSXVectorSourceRef = {
  getVectorSource: () => OlVectorSource | null;
  getRegistry: () => FeaturesRegistry;
  isSourceReady: boolean;
};
