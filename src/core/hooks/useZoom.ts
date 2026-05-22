import type { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { useCallback, useEffect, useState } from "react";
import { useMapRefsContext } from "../model/context";

export function useZoom() {
  const { mapRef, viewRef } = useMapRefsContext();
  const [zoom, setZoomState] = useState(0);

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
        return;
      }

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
    (addZoom = 1) => {
      const view = viewRef.current;
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? zoom) + addZoom,
        duration: 250,
      });
    },
    [viewRef, zoom],
  );

  const zoomOut = useCallback(
    (subtractZoom = 1) => {
      const view = viewRef.current;
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? zoom) - subtractZoom,
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
    zoomIn,
    zoomOut,
    setZoom,
    zoom,
  };
}
