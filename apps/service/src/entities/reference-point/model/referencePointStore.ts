import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const RADIUS_OPTIONS = [300, 500, 1000] as const;
export const DEFAULT_RADIUS = 500;
export const REFERENCE_POINT_STORAGE_KEY = 'dlrm-reference-point';

export type Radius = (typeof RADIUS_OPTIONS)[number];

export type Coordinates = {
  lat: number;
  lng: number;
};

// 현재 위치의 coordinates 가 null 이면 아직 좌표를 얻기 전(새로고침 후 복원 직후 등)이다
export type ReferencePoint =
  | { type: 'neighborhood'; neighborhoodId: string }
  | { type: 'currentLocation'; coordinates: Coordinates | null };

type ReferencePointState = {
  referencePoint: ReferencePoint | null;
  radius: Radius;
};

type ReferencePointActions = {
  selectNeighborhood: (neighborhoodId: string) => void;
  selectCurrentLocation: (coordinates: Coordinates) => void;
  setRadius: (radius: Radius) => void;
  // 저장소 키를 지우지 않고 초기값({ referencePoint: null, radius: 500 })으로 덮어쓴다.
  // 저장된 기준점이 있는지는 키 존재 여부가 아니라 referencePoint 가 null 인지로 판단해야 한다
  reset: () => void;
};

const initialState: ReferencePointState = {
  referencePoint: null,
  radius: DEFAULT_RADIUS,
};

// GR-03: 좌표는 저장하지 않는다. 현재 위치 기준은 플래그만 남기고, 복원 후 화면이 좌표를 다시 얻는다
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
  if (type === 'neighborhood' && typeof neighborhoodId === 'string') {
    return { type, neighborhoodId };
  }

  return null;
}

// 저장 공간이 가득 찼거나 막혀 있어도 기준점 변경 자체는 실패하지 않도록 쓰기 오류를 삼킨다
const safeSessionStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> =
  {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => {
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // 메모리 상태만 유지한다
      }
    },
    removeItem: (key) => sessionStorage.removeItem(key),
  };

export const useReferencePointStore = create<
  ReferencePointState & ReferencePointActions
>()(
  persist(
    (set) => ({
      ...initialState,
      selectNeighborhood: (neighborhoodId) =>
        set({ referencePoint: { type: 'neighborhood', neighborhoodId } }),
      selectCurrentLocation: (coordinates) =>
        set({ referencePoint: { type: 'currentLocation', coordinates } }),
      setRadius: (radius) => set({ radius }),
      reset: () => set(initialState),
    }),
    {
      name: REFERENCE_POINT_STORAGE_KEY,
      storage: createJSONStorage(() => safeSessionStorage),
      partialize: ({ referencePoint, radius }) => ({
        referencePoint: toPersistedReferencePoint(referencePoint),
        radius,
      }),
      merge: (persistedState, currentState) => {
        if (typeof persistedState !== 'object' || persistedState === null) {
          return currentState;
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
