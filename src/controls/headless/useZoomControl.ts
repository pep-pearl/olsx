import type { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { useCallback, useEffect, useState } from "react";
import { useMapReadyContext, useMapRefsContext } from "../../core/model/context";

export type ZoomControlApi = {
  zoom: number;
  isReady: boolean;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  setZoom: (zoom: number) => void;
};

export function useZoomControl(): ZoomControlApi {
  const { mapRef, viewRef } = useMapRefsContext();
  const { isMapReady } = useMapReadyContext();
  const [zoom, setZoomState] = useState(0);
  const [isViewReady, setIsViewReady] = useState(false);

  useEffect(() => {
    let viewKey: EventsKey | undefined;
    let mapKey: EventsKey | undefined;

    const unbindView = () => {
      if (viewKey) {
        unByKey(viewKey);
        viewKey = undefined;
      }
    };

    const bindView = () => {
      unbindView();

      const view = viewRef.current;
      if (!view) {
        setZoomState(0);
        setIsViewReady(false);
        return;
      }

      setIsViewReady(true);
      setZoomState(view.getZoom() ?? 0);
      viewKey = view.on("change:resolution", () => {
        setZoomState(view.getZoom() ?? 0);
      });
    };

    bindView();

    if (mapRef.current) {
      mapKey = mapRef.current.on("change:view", bindView);
    }

    return () => {
      if (mapKey) {
        unByKey(mapKey);
      }

      unbindView();
    };
  }, [mapRef, viewRef]);

  const zoomIn = useCallback(
    (step = 1) => {
      const view = viewRef.current;
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? zoom) + step,
        duration: 250,
      });
    },
    [viewRef, zoom],
  );

  const zoomOut = useCallback(
    (step = 1) => {
      const view = viewRef.current;
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? zoom) - step,
        duration: 250,
      });
    },
    [viewRef, zoom],
  );

  const setZoom = useCallback(
    (nextZoom: number) => {
      const view = viewRef.current;
      if (!view) return;

      view.animate({
        zoom: nextZoom,
        duration: 250,
      });
    },
    [viewRef],
  );

  return {
    zoom,
    isReady: isMapReady && isViewReady,
    zoomIn,
    zoomOut,
    setZoom,
  };
}
