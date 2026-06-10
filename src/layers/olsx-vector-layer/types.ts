import type Feature from "ol/Feature";
import { type FeatureLike } from "ol/Feature";
import type { Geometry } from "ol/geom";
import type { Type } from "ol/geom/Geometry";
import Draw, { type DrawEvent } from "ol/interaction/Draw";
import type VectorLayer from "ol/layer/Vector";
import type OlVectorSource from "ol/source/Vector";
import type { Style } from "ol/style";
import type { FlatStyleLike } from "ol/style/flat";
import type { StyleLike } from "ol/style/Style";
import type { FeaturesRegistry } from "./registry/featuresRegistry";

export type OLSXFeaturesProps<
  TType extends string = string,
  TData extends object = object,
> = {
  id: string;
  featureType: TType;
  getId: (item: TData) => string;
  getGeometry: (item: TData) => Geometry;
  data: Array<TData>;
  onClick?: (item: TData, feature: FeatureLike) => void;
  onHover?: (item: TData, feature: FeatureLike) => void;
  onHoverEnd?: (item?: TData, feature?: FeatureLike) => void;
};

export type OLSXFeaturesRef = { getFeatures: () => Feature[] };

type VectorStyleResult = Style | Style[] | void;

export type OLSXVectorLayerProps<
  TTypes extends readonly string[] = readonly string[],
> = {
  id: string;
  featureTypes?: TTypes;
  style?: (
    feature: FeatureLike,
    featureType?: TTypes[number],
  ) => VectorStyleResult;
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
  featureType?: TType;
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

export type OLSXDrawProps = {
  id?: string;
  active?: boolean;
  type?: Type;
  style?: StyleLike | FlatStyleLike;
  onDrawStart?: (event: DrawEvent) => void;
  onDrawEnd?: (event: DrawEvent) => void;
  onDrawAbort?: (event: DrawEvent) => void;
  clickTolerance?: number;
  children?:
    | React.ReactNode
    | ((props: {
        draw: Draw | null;
        id: string;
        active: boolean;
        isDrawReady: boolean;
      }) => React.ReactNode);
};

export type OLSXDrawRef = {
  getDraw: () => Draw | null;
  getId: () => string;
  isActive: () => boolean;
};

export type { OLSXAreaDrawProps } from "./components/OLSXAreaDraw";
export type { OLSXCircleDrawProps } from "./components/OLSXCircleDraw";
export type { OLSXDistanceDrawProps } from "./components/OLSXDistanceDraw";
