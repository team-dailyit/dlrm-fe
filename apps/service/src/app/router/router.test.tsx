import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

function getHeading(name: string) {
  return screen.getByRole('heading', { name });
}

describe('router', () => {
  describe('정의된 경로로 접속했을 때', () => {
    it.each([
      ['/', '온보딩'],
      ['/neighborhood', '동네 고르기'],
      ['/map', '지도 홈'],
    ])('%s에서 "%s" 화면을 렌더합니다', (path, screenName) => {
      renderAt(path);

      expect(getHeading(screenName)).toBeInTheDocument();
    });

    it('/map/place/:id에서 지도 홈 위에 장소 상세를 함께 렌더합니다', () => {
      renderAt('/map/place/place-1');

      expect(getHeading('지도 홈')).toBeInTheDocument();
      expect(getHeading('장소 상세')).toBeInTheDocument();
    });
  });

  describe('정의되지 않은 경로로 접속했을 때', () => {
    it.each(['/unknown', '/map/unknown', '/map/place'])(
      '%s에서는 지도 홈 없이 404 안내 화면만 렌더합니다',
      (path) => {
        renderAt(path);

        expect(getHeading('페이지를 찾을 수 없어요')).toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { name: '지도 홈' }),
        ).not.toBeInTheDocument();
      },
    );

    it('지도 홈으로 이동하는 링크를 렌더합니다', () => {
      renderAt('/unknown');

      expect(
        screen.getByRole('link', { name: '지도 홈으로 이동' }),
      ).toHaveAttribute('href', '/map');
    });
  });
});
