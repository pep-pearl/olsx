/**
 * @ai-purpose Typed factory for the compound vector layer API used by React consumers.
 * @ai-entry true
 * @ai-domain public-api
 * @ai-depends VectorLayer, VectorSource, FeatureSet, vector FeatureSetProps.
 * @ai-used-by src/layers/olsx-vector-layer/index.ts and consumers needing typed layer-specific data.
 * @ai-keywords createVectorLayer, defineOlsxVectorLayer, OLSXVectorLayerCompound, FeatureSet.
 * @ai-notes Preserve the compound component shape: Layer.Source and Layer.FeatureSet.
 */

import type { ComponentType, LazyExoticComponent } from "react";
import { FeatureSet } from "../components/FeatureSet";
import { OLSXVectorLayer } from "../components/OLSXVectorLayer";
import { VectorSource } from "../components/VectorSource";
import type { FeatureSetProps, OLSXVectorLayerProps } from "../types";

export type OLSXVectorLayerCompound<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
> = ComponentType<OLSXVectorLayerProps<TTypes>> & {
  Source: LazyExoticComponent<ComponentType>;

  FeatureSet: LazyExoticComponent<
    ComponentType<FeatureSetProps<TTypes[number], TData>>
  >;
};

export function defineOlsxVectorLayer<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
>() {
  return Object.assign(
    OLSXVectorLayer as ComponentType<OLSXVectorLayerProps<TTypes>>,
    {
      Source: VectorSource as ComponentType,
      FeatureSet: FeatureSet as ComponentType<
        FeatureSetProps<TTypes[number], TData>
      >,
    },
  ) as OLSXVectorLayerCompound<TTypes, TData>;
}
