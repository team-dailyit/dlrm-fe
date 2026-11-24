/*
 * 장소 상세 경로(/map/place/:id)의 :id 를 장소 코드로 바꾼다. 정수 표기가 아니면 null 이다.
 * 주소창은 사용자가 고칠 수 있고 Number 는 1e3·0x10 같은 표기도 숫자로 읽으므로, 숫자로만 된 문자열인지 먼저 본다.
 * null 이면 화면이 조회하지 않고 없는 장소로 안내한다
 */
export function toPlaceId(param: string | undefined): number | null {
  if (!param || !/^\d+$/.test(param)) {
    return null;
  }

  return Number(param);
}
