/**
 * @ai-purpose Helper for safely cleaning up OpenLayers Overlays from maps to avoid DOM leaks.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends OverlayLifecycleTarget
 * @ai-used-by useOLSXOverlay hook
 * @ai-keywords cleanupOverlay, overlay, unmount
 */

type OverlayLifecycleTarget = {
  setElement: (element: HTMLElement | undefined) => void;
  setPosition: (position: undefined) => void;
};

type OverlayMapTarget<TOverlay> = {
  removeOverlay: (overlay: TOverlay) => void;
};

export function cleanupOverlay<TOverlay extends OverlayLifecycleTarget>({
  map,
  overlay,
}: {
  map: OverlayMapTarget<TOverlay>;
  overlay: TOverlay;
}) {
  overlay.setPosition(undefined);
  map.removeOverlay(overlay);
  overlay.setElement(undefined);
}
