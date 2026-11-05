import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { neighborhoodQueries } from '@/entities/neighborhood';
import { useReferencePointStore } from '@/entities/reference-point';

type NeighborhoodSelectFormProps = {
  // 기준점을 저장한 뒤 호출한다. 확인 뒤 어디로 갈지는 폼을 쓰는 화면이 정한다
  onConfirm: () => void;
};

// 시안 퍼블리싱은 다른 작업에서 하므로, 선택 상태가 보조기기에 전달되는 최소 구조(라디오 그룹)만 둔다
export default function NeighborhoodSelectForm({
  onConfirm,
}: NeighborhoodSelectFormProps) {
  const { data: neighborhoods } = useSuspenseQuery(neighborhoodQueries.list());
  const referencePoint = useReferencePointStore(
    (state) => state.referencePoint,
  );
  const selectNeighborhood = useReferencePointStore(
    (state) => state.selectNeighborhood,
  );
  // 이미 동네를 기준점으로 저장했다면 그 동네를 미리 선택해 둔다. 목록에 없는 코드는 고르지 않은 것으로 본다
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (referencePoint?.type !== 'neighborhood') {
      return null;
    }
    const isListed = neighborhoods.some(
      ({ neighborhoodId }) => neighborhoodId === referencePoint.neighborhoodId,
    );
    return isListed ? referencePoint.neighborhoodId : null;
  });

  const handleConfirm = () => {
    if (!selectedId) {
      return;
    }
    selectNeighborhood(selectedId);
    onConfirm();
  };

  return (
    <>
      <fieldset>
        <legend>동네</legend>
        {neighborhoods.map(({ neighborhoodId, name }) => (
          <label key={neighborhoodId}>
            <input
              type="radio"
              name="neighborhood"
              value={neighborhoodId}
              checked={selectedId === neighborhoodId}
              onChange={() => setSelectedId(neighborhoodId)}
            />
            {name}
          </label>
        ))}
      </fieldset>
      <button type="button" disabled={!selectedId} onClick={handleConfirm}>
        확인
      </button>
    </>
  );
}
