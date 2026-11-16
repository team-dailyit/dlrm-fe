import { describe, expect, it } from 'vitest';

import { toKakaoMapDirectionsUrl } from './toKakaoMapDirectionsUrl';

describe('toKakaoMapDirectionsUrl', () => {
  // 카카오맵은 쉼표로 장소명과 좌표를 나누므로, 장소명의 쉼표가 구분자로 읽히지 않아야 한다
  it('장소명·위도·경도로 길찾기 주소를 만들고, 장소명의 쉼표와 공백은 좌표와 섞이지 않게 인코딩합니다', () => {
    const url = toKakaoMapDirectionsUrl({
      name: 'Pop, Up Store',
      coordinates: { lat: 37.5445, lng: 127.0559 },
    });

    expect(url).toBe(
      'https://map.kakao.com/link/to/Pop%2C%20Up%20Store,37.5445,127.0559',
    );
  });
});
