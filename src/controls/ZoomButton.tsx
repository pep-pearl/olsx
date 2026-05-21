import { type ReactNode, useCallback } from "react";
import { useMapContext } from "../core/context";

type ZoomControls = {
  zoomIn: (addZoom: number) => void;
  zoomOut: (subtractZoom: number) => void;
  setZoom: (zoomLevel: number) => void;
  getZoom: () => number;
};

type ZoomButtonProps = {
  children?: ReactNode | ((controls: ZoomControls) => ReactNode);
};

export function ZoomButton({ children }: ZoomButtonProps) {
  const { mapRef } = useMapContext();

  const getView = useCallback(() => {
    return mapRef.current?.getView() ?? null;
  }, [mapRef]);

  const getZoom = useCallback(() => {
    return getView()?.getZoom() ?? 0;
  }, [getView]);

  const zoomIn = useCallback(
    (addZoom = 1) => {
      const view = getView();
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? 0) + addZoom,
      });
    },
    [getView],
  );

  const zoomOut = useCallback(
    (subtractZoom = 1) => {
      const view = getView();
      if (!view) return;

      view.animate({
        zoom: (view.getZoom() ?? 0) - subtractZoom,
      });
    },
    [getView],
  );

  const setZoom = useCallback(
    (nextZoomLevel: number) => {
      const view = getView();
      if (!view) return;

      view.animate({
        zoom: nextZoomLevel,
      });
    },
    [getView],
  );

  const controls: ZoomControls = {
    zoomIn,
    zoomOut,
    setZoom,
    getZoom,
  };

  if (!children) {
    return (
      <button type="button" onClick={() => zoomIn()}>
        Zoom In
      </button>
    );
  }

  if (typeof children === "function") {
    return <>{children(controls)}</>;
  }

  return children;
}
