import type { ComponentType, LazyExoticComponent } from "react";
import { FeatureSet } from "./FeatureSet";
import { OLSXVectorLayer, type VectorLayerProps } from "./VectorLayer";
import { VectorSource } from "./VectorSource";
import type { FeatureSetProps } from "./types";

export type OLSXVectorLayerCompound<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
> = ComponentType<VectorLayerProps<TTypes>> & {
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
    OLSXVectorLayer as ComponentType<VectorLayerProps<TTypes>>,
    {
      Source: VectorSource as ComponentType,
      FeatureSet: FeatureSet as ComponentType<
        FeatureSetProps<TTypes[number], TData>
      >,
    },
  ) as OLSXVectorLayerCompound<TTypes, TData>;
}
