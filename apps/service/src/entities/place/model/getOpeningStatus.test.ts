import { describe, expect, it } from 'vitest';

import { getOpeningStatus } from './getOpeningStatus';
import type { OperatingHour } from './place';

// 2026-11-24 은 화요일, 2026-11-23 은 월요일이다
const TUESDAY_12_00 = new Date(2026, 10, 24, 12, 0);
const TUESDAY_13_00 = new Date(2026, 10, 24, 13, 0);
const TUESDAY_21_00 = new Date(2026, 10, 24, 21, 0);
const MONDAY_13_00 = new Date(2026, 10, 23, 13, 0);

// 테스트가 쓰는 월·화만 둔다. 월요일은 휴무, 화요일은 12:00~20:00 영업한다
const OPERATING_HOURS: OperatingHour[] = [
  { dayOfWeek: 'MON', isDayOff: true, openTime: null, closeTime: null },
  { dayOfWeek: 'TUE', isDayOff: false, openTime: '12:00', closeTime: '20:00' },
];

describe('getOpeningStatus', () => {
  describe('서버가 영업 중이라고 할 때', () => {
    it('영업 중으로 알리고, 오늘 닫는 시각을 함께 알려줍니다', () => {
      expect(
        getOpeningStatus(
          { isOpenNow: true, operatingHours: OPERATING_HOURS },
          TUESDAY_13_00,
        ),
      ).toEqual({ type: 'open', closeTime: '20:00' });
    });
  });

  describe('서버가 영업 중이 아니라고 할 때', () => {
    it('오늘이 휴무일이면 오늘 휴무로 알립니다', () => {
      expect(
        getOpeningStatus(
          { isOpenNow: false, operatingHours: OPERATING_HOURS },
          MONDAY_13_00,
        ),
      ).toEqual({ type: 'dayOff' });
    });

    // 정각까지는 오픈 전으로 보므로, 경계인 여는 시각 정각으로 확인한다
    it('오늘 여는 시각까지는 오픈 전으로 알리고, 여는 시각을 함께 알려줍니다', () => {
      expect(
        getOpeningStatus(
          { isOpenNow: false, operatingHours: OPERATING_HOURS },
          TUESDAY_12_00,
        ),
      ).toEqual({ type: 'beforeOpen', openTime: '12:00' });
    });

    it('오늘 여는 시각이 지났으면 영업 종료로 알립니다', () => {
      expect(
        getOpeningStatus(
          { isOpenNow: false, operatingHours: OPERATING_HOURS },
          TUESDAY_21_00,
        ),
      ).toEqual({ type: 'closed' });
    });
  });
});
