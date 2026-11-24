import { useEffect, useState } from 'react';

import {
  type ReferencePoint,
  useReferencePointStore,
} from '@/entities/reference-point';
import type { Radius } from '@/shared/model';

import { getRadiusToWiden, type SearchedPlaceCount } from './getRadiusToWiden';

type WidenedRadius = { from: Radius; to: Radius };

// 넓힌 반경을 어느 기준점에서 넓혔는지와 함께 기억한다. 기준점이 바뀌면 지난 안내는 맞지 않는다
type WideningChain = WidenedRadius & {
  referencePoint: ReferencePoint | null;
};

type WideningSnapshot = SearchedPlaceCount & {
  currentRadius: Radius;
  referencePoint: ReferencePoint | null;
};

/*
 * 받은 결과와 지금 기준을 보고 넓혔다는 안내를 다시 계산한다.
 * 기준점이 바뀌었거나 사용자가 반경을 직접 바꿨으면(넓힌 반경과 지금 반경이 다르면) 지난 안내를 버린다.
 * 이어서 넓히는 중이면 처음 반경을 지키고, 새로 넓히기 시작했으면 지금 반경부터 센다
 */
function getNextWideningChain(
  previous: WideningChain | null,
  { placeCount, radius, currentRadius, referencePoint }: WideningSnapshot,
): WideningChain | null {
  const isSameChain =
    previous !== null &&
    previous.referencePoint === referencePoint &&
    previous.to === currentRadius;
  const chain = isSameChain ? previous : null;
  const radiusToWiden =
    radius === currentRadius ? getRadiusToWiden({ placeCount, radius }) : null;
  if (radiusToWiden === null) {
    return chain;
  }

  return {
    from: chain?.to === radius ? chain.from : radius,
    to: radiusToWiden,
    referencePoint,
  };
}

function isSameSnapshot(a: WideningSnapshot, b: WideningSnapshot) {
  return (
    a.placeCount === b.placeCount &&
    a.radius === b.radius &&
    a.currentRadius === b.currentRadius &&
    a.referencePoint === b.referencePoint
  );
}

/*
 * 반경 안에 장소가 0곳이면 반경을 한 단계 넓힌다. 넓힌 반경으로도 0곳이면 다시 넓히고, 가장 넓은 반경에서 멈춘다.
 * 넓힌 반경은 사용자가 고른 반경처럼 기준점 스토어에 저장된다.
 * 받은 결과의 반경이 지금 반경과 같을 때만 넓힌다. 새 반경으로 받기 전의 지난 결과로 또 넓히거나, 사용자가 고른 반경을 덮어쓰지 않는다.
 * widenedRadius 는 처음 반경과 넓힌 반경으로, 화면이 "300m 안에 없어 1km로 넓혔어요" 같은 안내에 쓴다
 */
export function useAutoWidenRadius({ placeCount, radius }: SearchedPlaceCount) {
  const currentRadius = useReferencePointStore((state) => state.radius);
  const referencePoint = useReferencePointStore(
    (state) => state.referencePoint,
  );
  const setRadius = useReferencePointStore((state) => state.setRadius);
  const snapshot: WideningSnapshot = {
    placeCount,
    radius,
    currentRadius,
    referencePoint,
  };
  const [lastSnapshot, setLastSnapshot] = useState(snapshot);
  const [chain, setChain] = useState(() =>
    getNextWideningChain(null, snapshot),
  );

  // 안내는 화면에 그릴 값이라 effect 를 기다리지 않고, 받은 결과나 지금 기준이 바뀐 렌더에서 바로 계산한다
  if (!isSameSnapshot(lastSnapshot, snapshot)) {
    setLastSnapshot(snapshot);
    setChain((previous) => getNextWideningChain(previous, snapshot));
  }

  useEffect(() => {
    if (radius !== currentRadius) {
      return;
    }
    const radiusToWiden = getRadiusToWiden({ placeCount, radius });
    if (radiusToWiden !== null) {
      setRadius(radiusToWiden);
    }
  }, [placeCount, radius, currentRadius, setRadius]);

  return {
    widenedRadius: chain === null ? null : { from: chain.from, to: chain.to },
  };
}
