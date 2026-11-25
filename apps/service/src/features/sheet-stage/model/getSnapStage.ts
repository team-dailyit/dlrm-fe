import {
  HIGHEST_STAGE,
  LOWEST_STAGE,
  SHEET_STAGES,
  type SheetStage,
} from './sheetStage';

// 이 속도(px/ms) 이상이면 튕긴 것으로 본다
// TODO(FE-100): 시트 퍼블리싱 때 손맛을 보며 조정한다
const FLICK_VELOCITY = 0.5;

type SnapInput = {
  // 단계별 시트 높이(px). 화면 크기에 따라 달라서 시트 컴포넌트가 넘겨준다
  stageHeights: Record<SheetStage, number>;
  releasedHeight: number;
  upwardVelocity: number;
};

/**
 * 드래그를 놓았을 때 시트가 멈출 단계.
 * 빠르게 튕겼으면 놓은 높이에서 튕긴 방향의 다음 단계로, 아니면 가장 가까운 단계로 간다
 */
export function getSnapStage({
  stageHeights,
  releasedHeight,
  upwardVelocity,
}: SnapInput): SheetStage {
  if (upwardVelocity >= FLICK_VELOCITY) {
    return (
      SHEET_STAGES.find((stage) => stageHeights[stage] > releasedHeight) ??
      HIGHEST_STAGE
    );
  }
  if (upwardVelocity <= -FLICK_VELOCITY) {
    return (
      SHEET_STAGES.findLast((stage) => stageHeights[stage] < releasedHeight) ??
      LOWEST_STAGE
    );
  }
  return SHEET_STAGES.reduce((nearest, stage) =>
    Math.abs(stageHeights[stage] - releasedHeight) <
    Math.abs(stageHeights[nearest] - releasedHeight)
      ? stage
      : nearest,
  );
}
