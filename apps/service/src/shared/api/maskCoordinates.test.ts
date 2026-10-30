import { describe, expect, it } from 'vitest';

import { maskCoordinates } from './maskCoordinates';

describe('maskCoordinates', () => {
  describe('lat, lng 쿼리가 포함된 URL이 주어졌을 때', () => {
    it.each([
      [
        'lat, lng가 함께 있으면',
        '/api/places/nearby?lat=37.5445&lng=127.0560&radius=500',
        ['37.5445', '127.0560'],
      ],
      [
        'lng만 있으면',
        '/api/places/nearby?radius=500&lng=127.0560',
        ['127.0560'],
      ],
      ['해시가 뒤따르면', '/api/places/nearby?lat=37.5445#top', ['37.5445']],
    ])('%s 좌표 값을 가립니다', (_label, url, coordinates) => {
      const masked = maskCoordinates(url);

      coordinates.forEach((coordinate) =>
        expect(masked).not.toContain(coordinate),
      );
    });

    it.each([
      ['/api/places/nearby?lat=37.5445&lng=127.0560&radius=500', 'radius=500'],
      ['/api/places/nearby?lat=37.5445#top', '#top'],
    ])('%s에서 좌표가 아닌 부분은 유지합니다', (url, kept) => {
      expect(maskCoordinates(url)).toContain(kept);
    });
  });

  describe('좌표 쿼리가 없는 URL이 주어졌을 때', () => {
    it('URL을 그대로 반환합니다', () => {
      expect(maskCoordinates('/api/neighborhoods')).toBe('/api/neighborhoods');
    });
  });
});
