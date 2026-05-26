/**
 * @ai-purpose React hook that manages the lifecycle of a single OpenLayers Feature within a vector source.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends vectorLayerContext, featuresRegistry
 * @ai-used-by OLSXFeature component
 * @ai-keywords useFeature, Feature, lifecycle, vectorSource, featuresRegistry
 */

import { Feature } from "ol";
import type { Geometry } from "ol/geom";
import { useEffect, useRef } from "react";
import {
  FEATURE_ID_KEY,
  FEATURE_LAYER_ID_KEY,
  FEATURE_PROPERTIES_KEY,
  FEATURE_TYPE_KEY,
} from "../../../core/constants";
import { useVectorLayerContext } from "../internal/vectorLayerContext";

export function useFeature({
  featureId,
  type = "",
  geometry,
  data,
}: {
  featureId: string;
  type?: string;
  geometry?: Geometry;
  data: object;
}) {
  const {
    id: layerId,
    vectorSourceRef,
    featuresRegistryRef,
  } = useVectorLayerContext();
  const featureRef = useRef<Feature | null>(null);

  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource || !geometry) return;
    const featuresRegistry = featuresRegistryRef.current;

    const feature = new Feature({
      geometry,
      type,
      [FEATURE_ID_KEY]: featureId,
      [FEATURE_LAYER_ID_KEY]: layerId,
      [FEATURE_TYPE_KEY]: type,
      [FEATURE_PROPERTIES_KEY]: data,
    });
    feature.setId(featureId);

    vectorSource.addFeature(feature);
    featuresRegistry.set(featureId, feature);
    featureRef.current = feature;

    return () => {
      vectorSource.removeFeature(feature);
      featuresRegistry.delete(featureId);
      featureRef.current = null;
    };
  }, [
    featureId,
    featuresRegistryRef,
    geometry,
    layerId,
    data,
    type,
    vectorSourceRef,
  ]);

  return { featureRef };
}
