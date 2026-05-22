import { useCallback, useRef, useState } from "react";

type SetStateAction<T> = T | ((prev: T) => T);

/**
 * React state paired with a getter for the latest value.
 * Useful when OpenLayers event callbacks need current React state without
 * waiting for a render cycle.
 */
export function useStateWithGetter<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(initialValue);
  const ref = useRef(state);

  const setStateRef = useCallback((nextState: SetStateAction<T>) => {
    const next =
      typeof nextState === "function"
        ? (nextState as (prev: T) => T)(ref.current)
        : nextState;

    ref.current = next;
    setState(next);
  }, []);

  const getRef = useCallback(() => ref.current, []);

  return [state, setStateRef, getRef] as const;
}
