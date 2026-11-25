import { describe, expect, it } from 'vitest';

import { getSnapStage } from './getSnapStage';

// 시트 컴포넌트가 화면 크기에 맞춰 넘겨주는 단계별 높이(px)다
const STAGE_HEIGHTS = { peek: 24, half: 450, full: 700 };

// 기준(0.5px/ms)보다 느리면 놓은 자리에 맞추고, 기준 이상이면 튕긴 것으로 본다
const SLOW = 0.1;
const FAST_UP = 0.8;
const FAST_DOWN = -0.8;

describe('getSnapStage', () => {
  describe('천천히 놓았을 때', () => {
    it.each([
      [100, 'peek'],
      [500, 'half'],
      [650, 'full'],
    ] as const)(
      '%ipx 높이에서 놓으면 가장 가까운 %s 단계로 갑니다',
      (releasedHeight, expected) => {
        expect(
          getSnapStage({
            stageHeights: STAGE_HEIGHTS,
            releasedHeight,
            upwardVelocity: SLOW,
          }),
        ).toBe(expected);
      },
    );
  });

  describe('빠르게 튕겼을 때', () => {
    it('Half 근처에서 위로 튕기면 가까운 Half가 아니라 Full로 갑니다', () => {
      expect(
        getSnapStage({
          stageHeights: STAGE_HEIGHTS,
          releasedHeight: 480,
          upwardVelocity: FAST_UP,
        }),
      ).toBe('full');
    });

    it('Half 근처에서 아래로 튕기면 가까운 Half가 아니라 Peek로 갑니다', () => {
      expect(
        getSnapStage({
          stageHeights: STAGE_HEIGHTS,
          releasedHeight: 420,
          upwardVelocity: FAST_DOWN,
        }),
      ).toBe('peek');
    });

    it.each([
      [0.5, 480, 'full'],
      [-0.5, 420, 'peek'],
    ] as const)(
      '속도가 기준과 같은 %spx/ms면 튕긴 것으로 보고 %ipx 높이에서 %s로 갑니다',
      (upwardVelocity, releasedHeight, expected) => {
        expect(
          getSnapStage({
            stageHeights: STAGE_HEIGHTS,
            releasedHeight,
            upwardVelocity,
          }),
        ).toBe(expected);
      },
    );

    it('Full에서 더 위로 튕겨도 Full에 머뭅니다', () => {
      expect(
        getSnapStage({
          stageHeights: STAGE_HEIGHTS,
          releasedHeight: 720,
          upwardVelocity: FAST_UP,
        }),
      ).toBe('full');
    });

    it('Peek에서 더 아래로 튕겨도 Peek에 머뭅니다', () => {
      expect(
        getSnapStage({
          stageHeights: STAGE_HEIGHTS,
          releasedHeight: 10,
          upwardVelocity: FAST_DOWN,
        }),
      ).toBe('peek');
    });
  });
});
