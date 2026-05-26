import { View } from "ol";
import { fromLonLat } from "ol/proj";
import React, { useEffect, useImperativeHandle } from "react";
import { useMapContext } from "../../core/model/context";
import type { OLSXViewProps, OLSXViewRef } from "../types";

const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];
const DEFAULT_ZOOM = 16;

const OLSXViewComp = (
  { defaultCenter = DEFAULT_CENTER, defaultZoom = DEFAULT_ZOOM }: OLSXViewProps,
  ref: React.ForwardedRef<OLSXViewRef>,
) => {
  const { mapRef, viewRef } = useMapContext();

  useImperativeHandle(ref, () => {
    return {
      getView: () => viewRef.current,
    };
  }, [viewRef]);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const view = new View({
      center: fromLonLat(defaultCenter),
      zoom: defaultZoom,
    });

    map.setView(view);
    viewRef.current = view;

    return () => {
      map.setView(null);
      viewRef.current = null;
    };
  }, [defaultCenter, defaultZoom, mapRef, viewRef]);

  return null;
};

export const OLSXView = React.forwardRef(OLSXViewComp);
