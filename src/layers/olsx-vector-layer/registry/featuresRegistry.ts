import type Feature from "ol/Feature";

export type FeatureRegistryEntry =
  | {
      kind: "feature";
      feature: Feature;
    }
  | {
      kind: "features";
      features: Feature[];
    };

export type FeatureRegistryValue = Feature | Feature[];

export type FeaturesRegistry = {
  set: (id: string, value: FeatureRegistryValue) => void;
  get: (id: string) => FeatureRegistryEntry | undefined;
  has: (id: string) => boolean;
  delete: (id: string) => boolean;
  clear: () => void;
  entries: () => IterableIterator<[string, FeatureRegistryEntry]>;
};

export function createFeaturesRegistry(): FeaturesRegistry {
  const registry = new Map<string, FeatureRegistryEntry>();

  return {
    set(id, value) {
      registry.set(
        id,
        Array.isArray(value)
          ? { kind: "features", features: value }
          : { kind: "feature", feature: value },
      );
    },
    get: (id) => registry.get(id),
    has: (id) => registry.has(id),
    delete: (id) => registry.delete(id),
    clear: () => registry.clear(),
    entries: () => registry.entries(),
  };
}
