import type { Map, MapBrowserEvent } from "ol";
import type { Coordinate } from "ol/coordinate";
import { boundingExtent } from "ol/extent";
import type { FeatureLike } from "ol/Feature";
import type OlVectorSource from "ol/source/Vector";

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

/**
 * Finds a feature near a pointer event using the vector source spatial index.
 *
 * OpenLayers' `forEachFeatureAtPixel` performs canvas hit detection for styled
 * vector layers. On dense marker layers this can trigger expensive
 * `getImageData` readbacks on every pointermove. Hover only needs a coarse
 * marker hit-test, so source/index based lookup is much cheaper and avoids the
 * canvas readback path entirely.
 */
export function findIndexedFeatureAtEvent<
  TFeature extends FeatureLike = FeatureLike,
>(
  map: Map,
  source: OlVectorSource,
  event: MapBrowserEvent,
  predicate: (feature: FeatureLike) => feature is TFeature,
  hitTolerance = 18,
): TFeature | undefined {
  const coordinate = event.coordinate;
  const resolution = map.getView().getResolution() ?? 1;
  const tolerance = Math.max(hitTolerance * resolution, resolution);
  const extent = boundingExtent([
    [coordinate[0] - tolerance, coordinate[1] - tolerance],
    [coordinate[0] + tolerance, coordinate[1] + tolerance],
  ]);

  let closestFeature: TFeature | undefined;
  let closestSquaredDistance = Number.POSITIVE_INFINITY;
  const maxSquaredDistance = tolerance * tolerance;

  source.forEachFeatureInExtent(extent, (feature) => {
    if (!predicate(feature)) return;

    const geometry = feature.getGeometry();
    if (!geometry) return;

    const closestPoint = getClosestPoint(geometry, coordinate);
    if (!closestPoint) return;

    const squaredDistance = getSquaredDistance(coordinate, closestPoint);
    if (
      squaredDistance <= maxSquaredDistance &&
      squaredDistance < closestSquaredDistance
    ) {
      closestFeature = feature;
      closestSquaredDistance = squaredDistance;
    }
  });

  return closestFeature;
}

function getClosestPoint(
  geometry: { getClosestPoint?: (coordinate: Coordinate) => Coordinate },
  coordinate: Coordinate,
) {
  return geometry.getClosestPoint?.(coordinate);
}

function getSquaredDistance(a: Coordinate, b: Coordinate) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}
