export type ListenerKey = {
  unlisten?: () => void;
};

export type ListenerRegistry = Map<string, ListenerKey[]>;

export type EventTargetWithOn = {
  on: (type: string, listener: (event: never) => void) => ListenerKey;
};

export type MapEventTarget = EventTargetWithOn;

export function createListenerRegistry(): ListenerRegistry {
  return new Map();
}

export function registerTargetListener(
  registry: ListenerRegistry,
  target: EventTargetWithOn,
  id: string,
  type: string,
  listener: (event: never) => void,
) {
  const key = target.on(type, listener);
  const existing = registry.get(id) ?? [];

  registry.set(id, [...existing, key]);

  return () => {
    key.unlisten?.();

    const nextKeys = (registry.get(id) ?? []).filter(
      (registeredKey) => registeredKey !== key,
    );

    if (nextKeys.length === 0) {
      registry.delete(id);
      return;
    }

    registry.set(id, nextKeys);
  };
}

export function registerMapListener(
  registry: ListenerRegistry,
  map: MapEventTarget,
  id: string,
  type: string,
  listener: (event: never) => void,
) {
  return registerTargetListener(registry, map, id, type, listener);
}

export function registerDrawListener(
  registry: ListenerRegistry,
  draw: EventTargetWithOn,
  id: string,
  type: "drawstart" | "drawend" | "drawabort",
  listener: (event: never) => void,
) {
  return registerTargetListener(registry, draw, id, type, listener);
}

export function clearListeners(registry: ListenerRegistry, id?: string) {
  const entries = id ? [[id, registry.get(id) ?? []] as const] : registry;

  for (const [entryId, keys] of entries) {
    keys.forEach((key) => {
      key.unlisten?.();
    });
    registry.delete(entryId);
  }
}

export const clearMapListeners = clearListeners;
