import type { ComponentType, LazyExoticComponent } from "react";
import { FeatureSet, type FeatureSetProps } from "./FeatureSet";
import { VectorLayer, type VectorLayerProps } from "./VectorLayer";
import { VectorSource } from "./VectorSource";

export type VectorLayerCompound<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
> = ComponentType<VectorLayerProps<TTypes>> & {
  Source: LazyExoticComponent<ComponentType>;

  FeatureSet: LazyExoticComponent<
    ComponentType<FeatureSetProps<TTypes[number], TData>>
  >;
};

export function createVectorLayer<
  TTypes extends readonly string[] = readonly string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends object = any,
>() {
  return Object.assign(VectorLayer as ComponentType<VectorLayerProps<TTypes>>, {
    Source: VectorSource as ComponentType,
    FeatureSet: FeatureSet as ComponentType<
      FeatureSetProps<TTypes[number], TData>
    >,
  }) as VectorLayerCompound<TTypes, TData>;
}
