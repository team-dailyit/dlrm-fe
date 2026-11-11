import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  type Coordinates,
  DEFAULT_RADIUS,
  type Radius,
  RADIUS_OPTIONS,
} from '@/shared/types';

export const REFERENCE_POINT_STORAGE_KEY = 'dlrm-reference-point';
const LAST_NEIGHBORHOOD_STORAGE_KEY = 'dlrm-last-neighborhood';

// 현재 위치의 coordinates 가 null 이면 아직 좌표를 얻기 전(새로고침 후 복원 직후 등)이다
export type ReferencePoint =
  | { type: 'neighborhood'; neighborhoodId: number }
  | { type: 'currentLocation'; coordinates: Coordinates | null };

type ReferencePointState = {
  referencePoint: ReferencePoint | null;
  radius: Radius;
};

type ReferencePointActions = {
  selectNeighborhood: (neighborhoodId: number) => void;
  selectCurrentLocation: (coordinates: Coordinates) => void;
  setRadius: (radius: Radius) => void;
  // sessionStorage 키를 지우지 않고 초기값({ referencePoint: null, radius: 500 })으로 덮어쓰고, localStorage의 지난 동네는 지운다.
  // 저장된 기준점이 있는지는 키 존재 여부가 아니라 referencePoint 가 null 인지로 판단해야 한다
  reset: () => void;
};

const initialState: ReferencePointState = {
  referencePoint: null,
  radius: DEFAULT_RADIUS,
};

function toPersistedReferencePoint(
  referencePoint: ReferencePoint | null,
): ReferencePoint | null {
  if (referencePoint?.type === 'currentLocation') {
    return { type: 'currentLocation', coordinates: null };
  }

  return referencePoint;
}

function isRadius(value: unknown): value is Radius {
  return RADIUS_OPTIONS.some((option) => option === value);
}

function isNeighborhoodId(value: unknown): value is number {
  return Number.isSafeInteger(value);
}

// 저장소 값은 사용자가 바꾸거나 손상됐을 수 있으므로 신뢰하지 않고 안전한 값으로 바로잡는다
function parseReferencePoint(value: unknown): ReferencePoint | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { type, neighborhoodId } = value as {
    type?: unknown;
    neighborhoodId?: unknown;
  };

  if (type === 'currentLocation') {
    return { type, coordinates: null };
  }
  if (type === 'neighborhood' && isNeighborhoodId(neighborhoodId)) {
    return { type, neighborhoodId };
  }

  return null;
}

// 저장 공간이 가득 찼거나 막혀 있어도 기준점 변경 자체는 실패하지 않도록 쓰기 오류를 삼킨다
function writeSafely(write: () => void) {
  try {
    write();
  } catch {
    // 메모리 상태만 유지한다
  }
}

// 같은 세션의 새로고침은 persist가 sessionStorage로 복원한다
const safeSessionStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> =
  {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) =>
      writeSafely(() => sessionStorage.setItem(key, value)),
    removeItem: (key) => writeSafely(() => sessionStorage.removeItem(key)),
  };

// 다음 방문 때는 동네 기준만 기억한다. 현재 위치는 재접속하면 위치 권한으로 다시 받으므로 남기지 않는다
type LastNeighborhood = { neighborhoodId: number; radius: Radius };

function forgetLastNeighborhood() {
  writeSafely(() => localStorage.removeItem(LAST_NEIGHBORHOOD_STORAGE_KEY));
}

function rememberLastNeighborhood(lastNeighborhood: LastNeighborhood) {
  try {
    localStorage.setItem(
      LAST_NEIGHBORHOOD_STORAGE_KEY,
      JSON.stringify(lastNeighborhood),
    );
  } catch {
    // 새 동네를 남기지 못했으면 예전 동네가 다음 방문 때 복원되지 않도록 지운다
    forgetLastNeighborhood();
  }
}

function readLastNeighborhood(): ReferencePointState | null {
  try {
    const stored = localStorage.getItem(LAST_NEIGHBORHOOD_STORAGE_KEY);
    const { neighborhoodId, radius } = JSON.parse(stored ?? 'null') as {
      neighborhoodId?: unknown;
      radius?: unknown;
    };
    if (!isNeighborhoodId(neighborhoodId)) {
      return null;
    }
    return {
      referencePoint: { type: 'neighborhood', neighborhoodId },
      radius: isRadius(radius) ? radius : DEFAULT_RADIUS,
    };
  } catch {
    return null;
  }
}

export const useReferencePointStore = create<
  ReferencePointState & ReferencePointActions
>()(
  persist(
    (set, get) => ({
      ...initialState,
      selectNeighborhood: (neighborhoodId) => {
        set({ referencePoint: { type: 'neighborhood', neighborhoodId } });
        rememberLastNeighborhood({ neighborhoodId, radius: get().radius });
      },
      selectCurrentLocation: (coordinates) => {
        set({ referencePoint: { type: 'currentLocation', coordinates } });
        forgetLastNeighborhood();
      },
      setRadius: (radius) => {
        set({ radius });
        // 동네 기준일 때만 지난 동네의 반경을 갱신한다. 현재 위치 기준이면 다른 탭이 남긴 지난 동네를 건드리지 않는다
        const { referencePoint } = get();
        if (referencePoint?.type === 'neighborhood') {
          rememberLastNeighborhood({
            neighborhoodId: referencePoint.neighborhoodId,
            radius,
          });
        }
      },
      reset: () => {
        set(initialState);
        forgetLastNeighborhood();
      },
    }),
    {
      name: REFERENCE_POINT_STORAGE_KEY,
      storage: createJSONStorage(() => safeSessionStorage),
      partialize: ({ referencePoint, radius }) => ({
        referencePoint: toPersistedReferencePoint(referencePoint),
        radius,
      }),
      merge: (persistedState, currentState) => {
        // 이번 세션에 저장한 값이 없으면(재접속) 다음 방문용으로 남긴 지난 동네로 시작한다
        if (typeof persistedState !== 'object' || persistedState === null) {
          return { ...currentState, ...readLastNeighborhood() };
        }
        const { referencePoint, radius } = persistedState as {
          referencePoint?: unknown;
          radius?: unknown;
        };

        return {
          ...currentState,
          referencePoint: parseReferencePoint(referencePoint),
          radius: isRadius(radius) ? radius : DEFAULT_RADIUS,
        };
      },
    },
  ),
);
