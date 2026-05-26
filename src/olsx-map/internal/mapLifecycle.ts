type DisposableMap = {
  dispose: () => void;
};

type RefObject<T> = {
  current: T;
};

export type MountMapOptions<TMap extends DisposableMap> = {
  target: HTMLElement;
  controls: unknown;
  mapRef: RefObject<TMap | null>;
  viewRef: RefObject<unknown | null>;
  createMap: (options: { target: HTMLElement; controls: unknown }) => TMap;
  setReady: (isReady: boolean) => void;
};

export function mountMap<TMap extends DisposableMap>({
  target,
  controls,
  mapRef,
  viewRef,
  createMap,
  setReady,
}: MountMapOptions<TMap>) {
  const map = createMap({ target, controls });

  mapRef.current = map;
  setReady(true);

  return () => {
    mapRef.current = null;
    viewRef.current = null;
    map.dispose();
    setReady(false);
  };
}
