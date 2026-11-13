import { afterEach, describe, expect, it, vi } from 'vitest';

import { toApiUrl } from './apiUrl';

// 다음 테스트에 바꾼 API 주소가 남지 않도록 되돌립니다
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('toApiUrl', () => {
  describe('API 주소가 설정되어 있을 때', () => {
    it('API 주소에 경로를 붙인 주소를 돌려줍니다', () => {
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');

      expect(toApiUrl('/places')).toBe('https://api.example.com/places');
    });
  });

  describe('API 주소가 상대 경로일 때', () => {
    it('지금 페이지 주소 기준으로 풀어 경로를 붙인 주소를 돌려줍니다', () => {
      vi.stubEnv('VITE_API_BASE_URL', '/api');

      expect(toApiUrl('/places')).toBe(`${window.location.origin}/places`);
    });
  });
});
