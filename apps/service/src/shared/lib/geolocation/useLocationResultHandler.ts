import { useCallback, useEffect, useRef } from 'react';

import type { LocationResult } from './useLocationPermission';

/*
 * 위치를 받아 결과를 한 번만 처리하는 함수를 돌려준다. 결과에 따라 무엇을 할지는 부르는 쪽이 정한다.
 * isRequesting 은 다음 렌더에야 바뀌어 빠르게 두 번 누르면 막지 못하므로, 진행 중인 작업을 ref 에 두고 함께 기다리게 해서 결과 처리가 한 번만 일어나게 한다.
 * requestLocation 은 부르는 쪽이 이미 쓰는 useLocationPermission 의 것을 받는다. 여기서 새로 부르면 isRequesting 이 따로 논다
 */
export function useLocationResultHandler(
  requestLocation: () => Promise<LocationResult>,
  handleResult: (result: LocationResult) => void | Promise<void>,
): () => Promise<void> {
  const pendingRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(false);
  // 매 렌더 새로 만든 처리 함수를 받아도 돌려주는 함수가 바뀌지 않도록 최신 함수를 ref 에 둔다
  const handleResultRef = useRef(handleResult);

  useEffect(() => {
    handleResultRef.current = handleResult;
  });

  // 마운트될 때마다 true 로 다시 둔다. StrictMode 는 effect 를 정리했다가 다시 실행하므로 초기값만으로는 부족하다
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback((): Promise<void> => {
    if (pendingRef.current) {
      return pendingRef.current;
    }
    const pending = (async () => {
      const result = await requestLocation();
      // 위치를 기다리는 동안 화면이 사라졌으면, 그 사이 사용자가 고른 기준점을 덮어쓰거나 다른 화면으로 끌고 가지 않도록 아무것도 하지 않는다
      if (!isMountedRef.current) {
        return;
      }
      await handleResultRef.current(result);
    })().finally(() => {
      // 끝나면 비워야 실패 뒤 다시 시도할 수 있다
      pendingRef.current = null;
    });
    pendingRef.current = pending;

    return pending;
  }, [requestLocation]);
}
