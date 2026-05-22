import { useCallback, useRef, useState } from "react";

type SetStateAction<T> = T | ((prev: T) => T);

/**
 * useStateWithGetter는 React의 useState와 useRef를 결합하여, 상태 업데이트와 동시에 최신 상태 값을 참조할 수 있는 커스텀 훅입니다. 이 훅은 상태 값과 상태 업데이트 함수, 그리고 현재 상태 값을 반환하는 getRef 함수를 제공합니다. setStateRef 함수는 일반적인 setState와 동일하게 동작하지만, 내부적으로 ref를 업데이트하여 최신 상태 값을 항상 참조할 수 있도록 보장합니다. 이를 통해 비동기 작업이나 이벤트 핸들러 등에서 최신 상태 값을 안전하게 사용할 수 있습니다.
 * 
 * React 렌더링에도 필요하고,
OL 이벤트/외부 ref/콜백에서도 최신 값을 즉시 읽어야 하면 사용
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

  // getRef 함수는 현재 ref.current 값을 반환하는 함수로, useCallback을 사용하여 메모이제이션되어 있습니다. 이렇게 함으로써, 컴포넌트가 리렌더링될 때마다 동일한 getRef 함수를 사용할 수 있게 됩니다.
  const getRef = useCallback(() => ref.current, []);

  return [state, setStateRef, getRef] as const;
}
