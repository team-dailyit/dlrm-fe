import { describe, expect, it } from 'vitest';

import { toKakaoMapDirectionsUrl } from './toKakaoMapDirectionsUrl';

describe('toKakaoMapDirectionsUrl', () => {
  // 카카오맵은 장소명의 쉼표·슬래시를 인코딩해도 구분자로 읽어 길찾기를 열지 못한다
  it('장소명의 쉼표와 슬래시를 공백으로 바꿔 길찾기 링크를 만듭니다', () => {
    const url = toKakaoMapDirectionsUrl({
      name: 'Pop, Up/Store',
      coordinates: { lat: 37.5445, lng: 127.0559 },
    });

    expect(url).toBe(
      'https://map.kakao.com/link/to/Pop%20Up%20Store,37.5445,127.0559',
    );
  });
});
