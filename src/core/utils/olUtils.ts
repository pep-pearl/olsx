import type { Map, MapBrowserEvent } from "ol";
import type { Coordinate } from "ol/coordinate";
import type { FeatureLike } from "ol/Feature";

export function findFeatureAtEvent<TFeature extends FeatureLike = FeatureLike>(
  map: Map,
  event: MapBrowserEvent,
  predicate: (feature: FeatureLike) => feature is TFeature,
  hitTolerance = 5,
): TFeature | undefined {
  const feature = map.forEachFeatureAtPixel(
    event.pixel,
    (feat: FeatureLike) => {
      return predicate(feat) ? feat : undefined;
    },
    {
      hitTolerance,
    },
  );

  return feature;
}

export function getEventCoordinate(
  map: { getEventCoordinate: (event: MouseEvent) => Coordinate },
  event: MouseEvent,
) {
  return map.getEventCoordinate(event).slice(0, 2);
}
