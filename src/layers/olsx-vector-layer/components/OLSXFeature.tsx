import { Feature } from "ol";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  FEATURE_ID_KEY,
  FEATURE_LAYER_ID_KEY,
  FEATURE_PROPERTIES_KEY,
  FEATURE_TYPE_KEY,
} from "../../../core/constants";
import { useVectorLayerContext } from "../internal/vectorLayerContext";
import type { OLSXFeatureProps, OLSXFeatureRef } from "../types";

export function OLSXFeatureComp(
  { id: featureId, type, geometry, properties }: OLSXFeatureProps,
  ref: React.ForwardedRef<OLSXFeatureRef>,
) {
  const { id: layerId, vectorSourceRef, featuresRegistryRef } =
    useVectorLayerContext();
  const featureRef = useRef<Feature | null>(null);

  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return;
    const featuresRegistry = featuresRegistryRef.current;

    const feature = new Feature({
      geometry,
      type,
      [FEATURE_ID_KEY]: featureId,
      [FEATURE_LAYER_ID_KEY]: layerId,
      [FEATURE_TYPE_KEY]: type,
      [FEATURE_PROPERTIES_KEY]: properties,
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
    properties,
    type,
    vectorSourceRef,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      getFeature: () => featureRef.current,
    }),
    [featureRef],
  );

  return null;
}

export const OLSXFeature = forwardRef(OLSXFeatureComp);
