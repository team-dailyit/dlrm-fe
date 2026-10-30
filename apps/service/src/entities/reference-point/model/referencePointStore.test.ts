import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  test,
  vi,
} from 'vitest';

import {
  type Coordinates,
  DEFAULT_RADIUS,
  REFERENCE_POINT_STORAGE_KEY,
  useReferencePointStore,
} from './referencePointStore';

const NEIGHBORHOOD_ID = 'seongsu';
const COORDINATES: Coordinates = { lat: 37.5445, lng: 127.056 };

function getState() {
  return useReferencePointStore.getState();
}

function readStoredState() {
  return JSON.parse(
    sessionStorage.getItem(REFERENCE_POINT_STORAGE_KEY) ?? 'null',
  );
}

// 새로고침을 흉내 내기 위해 저장소에 값을 직접 넣고 스토어를 다시 복원합니다
async function restoreFrom(persistedState: unknown) {
  sessionStorage.setItem(
    REFERENCE_POINT_STORAGE_KEY,
    JSON.stringify({ state: persistedState, version: 0 }),
  );
  await useReferencePointStore.persist.rehydrate();
}

// 각 테스트 전에 스토어를 초기화하고, reset이 저장소에 남긴 값까지 지워 테스트끼리 영향을 주지 않게 합니다
beforeEach(() => {
  getState().reset();
  sessionStorage.clear();
});

describe('referencePointStore', () => {
  describe('처음 시작했을 때', () => {
    it('저장된 값이 없으면 복원해도 초기 상태를 유지합니다', async () => {
      await useReferencePointStore.persist.rehydrate();

      expect(getState().referencePoint).toBeNull();
      expect(getState().radius).toBe(DEFAULT_RADIUS);
    });
  });

  describe('기준점을 선택했을 때', () => {
    it('동네를 선택하면 기준점이 해당 동네가 됩니다', () => {
      getState().selectNeighborhood(NEIGHBORHOOD_ID);

      expect(getState().referencePoint).toEqual({
        type: 'neighborhood',
        neighborhoodId: NEIGHBORHOOD_ID,
      });
    });

    it('현재 위치를 선택하면 좌표와 함께 기준점이 현재 위치가 됩니다', () => {
      getState().selectCurrentLocation(COORDINATES);

      expect(getState().referencePoint).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
    });

    it('현재 위치에서 동네로 바꾸면 이전 좌표가 남지 않습니다', () => {
      getState().selectCurrentLocation(COORDINATES);

      getState().selectNeighborhood(NEIGHBORHOOD_ID);

      expect(getState().referencePoint).toEqual({
        type: 'neighborhood',
        neighborhoodId: NEIGHBORHOOD_ID,
      });
    });
  });

  describe('초기화했을 때', () => {
    it('기준점은 미설정으로, 반경은 기본값으로 돌아갑니다', () => {
      getState().selectCurrentLocation(COORDINATES);
      getState().setRadius(1000);

      getState().reset();

      expect(getState().referencePoint).toBeNull();
      expect(getState().radius).toBe(DEFAULT_RADIUS);
    });
  });

  describe('sessionStorage에 저장할 때', () => {
    it('동네 기준이면 동네 코드와 반경을 저장합니다', () => {
      getState().selectNeighborhood(NEIGHBORHOOD_ID);
      getState().setRadius(1000);

      expect(readStoredState().state).toEqual({
        referencePoint: {
          type: 'neighborhood',
          neighborhoodId: NEIGHBORHOOD_ID,
        },
        radius: 1000,
      });
    });

    it('현재 위치 기준이면 플래그와 반경만 저장하고 좌표는 저장하지 않습니다', () => {
      getState().selectCurrentLocation(COORDINATES);
      getState().setRadius(300);

      const stored = sessionStorage.getItem(REFERENCE_POINT_STORAGE_KEY);

      expect(readStoredState().state).toEqual({
        referencePoint: { type: 'currentLocation', coordinates: null },
        radius: 300,
      });
      expect(stored).not.toContain(String(COORDINATES.lat));
      expect(stored).not.toContain(String(COORDINATES.lng));
    });
  });

  describe('sessionStorage에 쓰지 못할 때', () => {
    // jsdom은 저장 공간 초과를 재현할 수 없어 setItem이 예외를 던지는 상황을 spy로 만듭니다
    let setItemSpy: MockInstance<Storage['setItem']>;

    beforeEach(() => {
      setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new DOMException('quota exceeded', 'QuotaExceededError');
        });
    });

    afterEach(() => {
      setItemSpy.mockRestore();
    });

    it('예외를 던지지 않고 메모리 상태는 정상적으로 바뀝니다', () => {
      expect(() =>
        getState().selectNeighborhood(NEIGHBORHOOD_ID),
      ).not.toThrow();
      expect(() => getState().setRadius(1000)).not.toThrow();
      expect(getState().referencePoint).toEqual({
        type: 'neighborhood',
        neighborhoodId: NEIGHBORHOOD_ID,
      });
      expect(getState().radius).toBe(1000);
    });
  });

  describe('새로고침 후 저장된 값을 복원할 때', () => {
    it('동네 기준과 반경을 그대로 복원합니다', async () => {
      await restoreFrom({
        referencePoint: {
          type: 'neighborhood',
          neighborhoodId: NEIGHBORHOOD_ID,
        },
        radius: 300,
      });

      expect(getState().referencePoint).toEqual({
        type: 'neighborhood',
        neighborhoodId: NEIGHBORHOOD_ID,
      });
      expect(getState().radius).toBe(300);
    });

    it('현재 위치 기준은 좌표 없음 상태로 복원해 화면이 좌표를 다시 얻게 합니다', async () => {
      await restoreFrom({
        referencePoint: { type: 'currentLocation', coordinates: null },
        radius: 1000,
      });

      expect(getState().referencePoint).toEqual({
        type: 'currentLocation',
        coordinates: null,
      });
      expect(getState().radius).toBe(1000);
    });

    describe('저장된 값이 예상과 다를 때', () => {
      test.each([
        ['반경이 선택지에 없으면', { radius: 250 }, { radius: 500 }],
        ['반경이 숫자가 아니면', { radius: '500' }, { radius: 500 }],
        [
          '기준점 종류를 알 수 없으면',
          { referencePoint: { type: 'unknown' }, radius: 300 },
          { referencePoint: null, radius: 300 },
        ],
        [
          '동네 코드가 문자열이 아니면',
          { referencePoint: { type: 'neighborhood', neighborhoodId: 1 } },
          { referencePoint: null },
        ],
        [
          '현재 위치에 좌표가 들어 있어도',
          {
            referencePoint: {
              type: 'currentLocation',
              coordinates: COORDINATES,
            },
          },
          {
            referencePoint: { type: 'currentLocation', coordinates: null },
          },
        ],
        [
          '현재 위치에 좌표 필드가 없어도',
          { referencePoint: { type: 'currentLocation' } },
          {
            referencePoint: { type: 'currentLocation', coordinates: null },
          },
        ],
      ])(
        '%s 안전한 값으로 바로잡아 복원합니다',
        async (_label, persisted, expected) => {
          await restoreFrom(persisted);

          expect(getState()).toMatchObject(expected);
        },
      );
    });
  });
});
