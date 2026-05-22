import type { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { useCallback, useEffect, useState } from "react";
import { useMapRefsContext } from "../../core/model/context";

export function useZoom() {
  const { mapRef } = useMapRefsContext();
  const [zoom, setZoomState] = useState(0);
  const [view, setView] = useState<ReturnType<
    NonNullable<typeof mapRef.current>["getView"]
  > | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    let viewKey: EventsKey | undefined;

    const bindView = () => {
      if (viewKey) {
        unByKey(viewKey);
        viewKey = undefined;
      }

      const nextView = map.getView();

      setView(nextView);
      setZoomState(nextView.getZoom() ?? 0);

      viewKey = nextView.on("change:resolution", () => {
        setZoomState(nextView.getZoom() ?? 0);
      });
    };

    bindView();

    const mapKey = map.on("change:view", bindView);

    return () => {
      unByKey(mapKey);

      if (viewKey) {
        unByKey(viewKey);
      }
    };
  }, [mapRef, setZoomState]);

  const zoomIn = useCallback(
    (addZoom = 1) => {
      if (!view) return;
      view.animate({
        zoom: (view.getZoom() ?? zoom) + addZoom,
        duration: 250,
      });
    },
    [view, zoom],
  );

  const zoomOut = useCallback(
    (subtractZoom = 1) => {
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? zoom) - subtractZoom,
        duration: 250,
      });
    },
    [view, zoom],
  );

  const setZoom = useCallback(
    (nextZoom: number) => {
      if (!view) return;

      view.animate({
        zoom: nextZoom,
        duration: 250,
      });
    },
    [view],
  );
  return {
    zoomIn,
    zoomOut,
    setZoom,
    zoom,
  };
}
