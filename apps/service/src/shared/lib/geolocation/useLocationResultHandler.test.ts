import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LocationResult } from './useLocationPermission';
import { useLocationResultHandler } from './useLocationResultHandler';

const GRANTED: LocationResult = {
  status: 'granted',
  coordinates: { lat: 37.5445, lng: 127.0559 },
};

// 위치 요청이 몇 번 나갔는지 확인한다
const requestLocationMock = vi.fn<() => Promise<LocationResult>>();

// 결과 처리가 몇 번, 어떤 결과로 불렸는지 확인한다
const handleResultMock = vi.fn<(result: LocationResult) => void>();

// 위치 응답을 붙잡아 두었다가, 돌려받은 함수를 부르면 그때 성공으로 응답한다
function holdLocationUntilReleased() {
  let releaseLocation = () => {};
  requestLocationMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        releaseLocation = () => resolve(GRANTED);
      }),
  );

  return () => releaseLocation();
}

function renderLocationResultHandler() {
  return renderHook(() =>
    useLocationResultHandler(requestLocationMock, handleResultMock),
  );
}

// 다음 테스트에 mock 동작과 호출 기록이 남지 않도록 지운다
afterEach(() => {
  requestLocationMock.mockReset();
  handleResultMock.mockReset();
});

describe('useLocationResultHandler', () => {
  it('위치를 받으면 그 결과로 결과 처리를 부릅니다', async () => {
    requestLocationMock.mockResolvedValue(GRANTED);
    const { result } = renderLocationResultHandler();

    await act(() => result.current());

    expect(handleResultMock).toHaveBeenCalledExactlyOnceWith(GRANTED);
  });

  it('위치를 받는 동안 다시 불러도 요청과 결과 처리는 한 번만 합니다', async () => {
    const releaseLocation = holdLocationUntilReleased();
    const { result } = renderLocationResultHandler();

    let first: Promise<void> = Promise.resolve();
    let second: Promise<void> = Promise.resolve();
    act(() => {
      first = result.current();
      second = result.current();
    });
    await act(async () => {
      releaseLocation();
      await Promise.all([first, second]);
    });

    expect(requestLocationMock).toHaveBeenCalledOnce();
    expect(handleResultMock).toHaveBeenCalledOnce();
  });

  // 실패한 뒤 다시 시도할 수 있어야 하므로, 끝난 작업이 남아 있으면 안 된다
  it('앞선 요청이 끝난 뒤 다시 부르면 위치를 새로 요청합니다', async () => {
    requestLocationMock.mockResolvedValue(GRANTED);
    const { result } = renderLocationResultHandler();

    await act(() => result.current());
    await act(() => result.current());

    expect(requestLocationMock).toHaveBeenCalledTimes(2);
  });

  it('위치를 받기 전에 화면이 사라지면 결과 처리를 부르지 않습니다', async () => {
    const releaseLocation = holdLocationUntilReleased();
    const { result, unmount } = renderLocationResultHandler();

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current();
    });
    unmount();
    await act(async () => {
      releaseLocation();
      await pending;
    });

    expect(handleResultMock).not.toHaveBeenCalled();
  });
});
