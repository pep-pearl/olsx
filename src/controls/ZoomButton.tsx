import type { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useMapContext } from "../core/context";

type ZoomControls = {
  zoomIn: (addZoom?: number) => void;
  zoomOut: (subtractZoom?: number) => void;
  setZoom: (zoom: number) => void;
  zoom: number;
};

type ZoomButtonProps = {
  children?: ReactNode | ((controls: ZoomControls) => ReactNode);
};

const defaultButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  border: "none",
  cursor: "pointer",
  padding: 8,
  boxSizing: "border-box",
  color: "#111827",
  backgroundColor: "transparent",
};

export function ZoomButton({ children }: ZoomButtonProps) {
  const { mapRef, isMapReady } = useMapContext();
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

  const controls: ZoomControls = {
    zoomIn,
    zoomOut,
    setZoom,
    zoom,
  };

  if (!children) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          padding: 0,
          margin: 0,
          border: "1px solid #e5e7eb",
          boxSizing: "border-box",
          borderRadius: 4,
          backgroundColor: "#ffffffcc",
        }}
      >
        <button
          style={defaultButtonStyle}
          type="button"
          onClick={() => zoomIn()}
          aria-label="Zoom In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1f1f1f"
            style={{ width: "100%", height: "100%" }}
          >
            <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z" />
          </svg>
        </button>
        <button
          style={{ ...defaultButtonStyle, borderTop: "1px solid #e5e7eb" }}
          type="button"
          onClick={() => zoomOut()}
          aria-label="Zoom Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1f1f1f"
            style={{ width: "100%", height: "100%" }}
          >
            <path d="M240-440q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h480q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H240Z" />
          </svg>
        </button>
      </div>
    );
  }

  if (!isMapReady) return null;

  if (typeof children === "function") {
    return children(controls);
  }

  return children;
}
