/**
 * @ai-purpose Typed factory for the compound vector layer API used by React consumers.
 * @ai-entry true
 * @ai-domain public-api
 * @ai-depends VectorLayer, VectorSource, Feature/Features vector source components.
 * @ai-used-by src/layers/olsx-vector-layer/index.ts and consumers needing typed layer-specific data.
 * @ai-keywords createVectorLayer, defineOlsxVectorLayer, OLSXVectorLayerCompound, Feature, Features, Draw.
 * @ai-notes Preserve the compound component shape: Layer.Source, Layer.Feature, Layer.Features, Layer.Draw, and legacy Layer.Features.
 */

import type { ComponentType } from "react";
import { OLSXDraw } from "../components/OLSXDraw";
import { OLSXFeature } from "../components/OLSXFeature";
import { OLSXFeatures } from "../components/OLSXFeatures";
import { OLSXVectorLayer } from "../components/OLSXVectorLayer";
import { OLSXVectorSource } from "../components/OLSXVectorSource";
import type {
  OLSXDrawProps,
  OLSXFeatureProps,
  OLSXFeaturesProps,
  OLSXVectorLayerProps,
} from "../types";

export type OLSXVectorLayerCompound<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
> = ComponentType<OLSXVectorLayerProps<TTypes>> & {
  Source: typeof OLSXVectorSource;
  Feature: ComponentType<OLSXFeatureProps<TTypes[number]>>;
  Features: ComponentType<OLSXFeaturesProps<TTypes[number], TData>>;
  Draw: ComponentType<OLSXDrawProps>;
};

export function defineOlsxVectorLayer<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
>() {
  return Object.assign(
    OLSXVectorLayer as ComponentType<OLSXVectorLayerProps<TTypes>>,
    {
      Source: OLSXVectorSource,
      Feature: OLSXFeature as ComponentType<OLSXFeatureProps<TTypes[number]>>,
      Features: OLSXFeatures as ComponentType<
        OLSXFeaturesProps<TTypes[number], TData>
      >,
      Draw: OLSXDraw as ComponentType<OLSXDrawProps>,
    },
  ) as OLSXVectorLayerCompound<TTypes, TData>;
}
