/**
 * @ai-purpose React portal wrapper for an OpenLayers Overlay anchored to a map coordinate.
 * @ai-entry true
 * @ai-domain map
 * @ai-depends MapRefsContext, OpenLayers Overlay, React portal rendering.
 * @ai-used-by Public package exports and consumers needing popups, labels, or coordinate-anchored UI.
 * @ai-keywords OLSXOverlay, OLSXOverlayRef, coordinate, positioning, autoPan, stopEvent, createPortal.
 * @ai-notes Keep overlay creation separate from portal children; coordinate/visible control whether the overlay is positioned.
 */

import OlOverlay from "ol/Overlay";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useMapRefsContext } from "../../core/model/context";
import { cleanupOverlay } from "../internal/overlayLifecycle";
import { syncOverlayPosition } from "../internal/overlayPosition";
import type { OLSXOverlayProps, OLSXOverlayRef } from "../types";

function OLSXOverlayComp(
  {
    id,
    coordinate,
    visible,
    positioning = "bottom-center",
    offset = [0, 0],
    autoPan = false,
    stopEvent = false,
    insertFirst = true,
    className,
    style,
    zIndex,
    children,
    element: propElement,
  }: OLSXOverlayProps,
  ref: React.ForwardedRef<OLSXOverlayRef>,
) {
  const { mapRef } = useMapRefsContext();

  const overlayRef = useRef<OlOverlay | null>(null);

  const [portalElement] = useState<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.createElement("div");
  });

  const isExternalElementMode = propElement !== undefined;
  const element = isExternalElementMode ? propElement : portalElement;

  const isVisible = visible ?? coordinate != null;

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !element) return;

    const overlay = new OlOverlay({
      id,
      element,
      stopEvent,
      insertFirst,
    });

    overlayRef.current = overlay;
    map.addOverlay(overlay);

    return () => {
      cleanupOverlay({ map, overlay });
      overlayRef.current = null;
    };
  }, [mapRef, element, id, stopEvent, insertFirst]);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) return;

    overlay.setPositioning(positioning);
  }, [positioning]);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) return;

    overlay.setOffset(offset);
  }, [offset]);

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) return;

    syncOverlayPosition({ overlay, coordinate, visible: isVisible, autoPan });
  }, [coordinate, isVisible, autoPan]);

  useImperativeHandle(
    ref,
    () => ({
      /**
       * Escape hatch for OpenLayers users.
       *
       * You may call OpenLayers methods directly.
       * Do not manually remove this overlay from the map while the React component is mounted.
       * Do not mutate overlay.getElement().children when children are rendered by React.
       */
      getOverlay: () => overlayRef.current,

      setPosition: (nextCoordinate) => {
        overlayRef.current?.setPosition(nextCoordinate ?? undefined);
      },

      panIntoView: (options) => {
        overlayRef.current?.panIntoView(options);
      },

      hide: () => {
        overlayRef.current?.setPosition(undefined);
      },
    }),
    [],
  );

  if (isExternalElementMode) {
    return null;
  }

  if (!portalElement) {
    return null;
  }

  return createPortal(
    <div
      className={className}
      style={{
        position: "relative",
        zIndex,
        ...style,
      }}
    >
      {children}
    </div>,
    portalElement,
  );
}

export const OLSXOverlay = forwardRef(OLSXOverlayComp);
