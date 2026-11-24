import type { DayOfWeek, Place } from './place';

// Date.getDay() 가 일요일을 0으로 세므로 그 순서대로 요일을 둔다
const DAYS_FROM_SUNDAY: DayOfWeek[] = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
];

/*
 * 오늘 영업 상태. 화면이 "21:00까지"·"12:00 오픈" 같은 문구를 만들 수 있도록 시각을 함께 준다.
 * 서버 데이터가 맞지 않아 오늘 영업시간이 없으면 닫는 시각은 null 이다
 */
export type OpeningStatus =
  | { type: 'open'; closeTime: string | null }
  | { type: 'dayOff' }
  | { type: 'beforeOpen'; openTime: string }
  | { type: 'closed' };

// "09:05" 형식. 영업시간과 같은 형식이라 문자열로 바로 비교할 수 있다
function toTimeText(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

/*
 * 영업 중인지는 서버 값(isOpenNow)을 따르고, 시각만 오늘 요일의 영업시간에서 가져온다.
 * 오늘과 지금 시각은 기기 시각 기준이다. 자정을 넘겨 영업하는 장소는 없어 닫는 시각은 항상 여는 시각보다 늦다고 본다
 */
export function getOpeningStatus(
  { isOpenNow, operatingHours }: Pick<Place, 'isOpenNow' | 'operatingHours'>,
  now: Date,
): OpeningStatus {
  const today = operatingHours.find(
    ({ dayOfWeek }) => dayOfWeek === DAYS_FROM_SUNDAY[now.getDay()],
  );
  if (isOpenNow) {
    return { type: 'open', closeTime: today?.closeTime ?? null };
  }
  if (!today || today.isDayOff || today.openTime === null) {
    return { type: 'dayOff' };
  }

  // 여는 시각 정각에 서버의 영업 중 반영이 늦어도 "영업 종료"로 보이지 않도록 정각까지는 오픈 전으로 본다
  return toTimeText(now) <= today.openTime
    ? { type: 'beforeOpen', openTime: today.openTime }
    : { type: 'closed' };
}
