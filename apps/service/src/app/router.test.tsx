import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, test } from 'vitest';

import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);

  return router;
}

function getHeading(name: string) {
  return screen.getByRole('heading', { name });
}

describe('router', () => {
  describe('정의된 경로로 접속했을 때', () => {
    test.each([
      ['/', '온보딩'],
      ['/neighborhood', '동네 고르기'],
      ['/map', '지도 홈'],
    ])('%s에서 "%s" 화면을 렌더합니다', (path, screenName) => {
      renderAt(path);

      expect(getHeading(screenName)).toBeInTheDocument();
    });
  });

  describe('/map/place/:id로 접속했을 때', () => {
    it('지도 홈 위에 장소 상세를 함께 렌더합니다', () => {
      renderAt('/map/place/place-1');

      expect(getHeading('지도 홈')).toBeInTheDocument();
      expect(getHeading('장소 상세')).toBeInTheDocument();
    });

    it('/map에서 상세로 이동해도 지도 홈을 다시 마운트하지 않습니다', async () => {
      const router = renderAt('/map');
      const mapHome = getHeading('지도 홈');

      await act(() => router.navigate('/map/place/place-1'));

      expect(getHeading('장소 상세')).toBeInTheDocument();
      expect(getHeading('지도 홈')).toBe(mapHome);
    });

    it('상세에서 /map으로 돌아가면 장소 상세만 사라집니다', async () => {
      const router = renderAt('/map/place/place-1');

      await act(() => router.navigate('/map'));

      expect(getHeading('지도 홈')).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: '장소 상세' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('공유 링크 /place/:id로 접속했을 때', () => {
    it('/map/place/:id로 리다이렉트해 장소 상세를 렌더합니다', () => {
      const router = renderAt('/place/place-1');

      expect(router.state.location.pathname).toBe('/map/place/place-1');
      expect(getHeading('지도 홈')).toBeInTheDocument();
      expect(getHeading('장소 상세')).toBeInTheDocument();
    });

    it('뒤로가기로 공유 링크에 되돌아오지 않도록 히스토리를 대체합니다', () => {
      const router = renderAt('/place/place-1');

      expect(router.state.historyAction).toBe('REPLACE');
    });

    it('경로 구분자나 쿼리로 해석되는 문자가 id에 있어도 id를 그대로 유지합니다', () => {
      const router = renderAt('/place/a%3Fb%23c');

      expect(router.state.location.pathname).toBe('/map/place/a%3Fb%23c');
      expect(router.state.location.search).toBe('');
      expect(router.state.location.hash).toBe('');
      expect(getHeading('장소 상세')).toBeInTheDocument();
    });
  });

  describe('정의되지 않은 경로로 접속했을 때', () => {
    test.each(['/unknown', '/map/unknown', '/map/place'])(
      '%s에서는 지도 홈 없이 404 안내 화면만 렌더합니다',
      (path) => {
        renderAt(path);

        expect(getHeading('페이지를 찾을 수 없어요')).toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { name: '지도 홈' }),
        ).not.toBeInTheDocument();
      },
    );

    it('404 안내 화면과 지도 홈으로 이동하는 링크를 렌더합니다', () => {
      renderAt('/unknown');

      expect(getHeading('페이지를 찾을 수 없어요')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: '지도 홈으로 이동' }),
      ).toHaveAttribute('href', '/map');
    });

    it('지도 홈으로 이동하는 링크를 누르면 지도 홈을 렌더합니다', async () => {
      renderAt('/unknown');

      await userEvent.click(
        screen.getByRole('link', { name: '지도 홈으로 이동' }),
      );

      expect(getHeading('지도 홈')).toBeInTheDocument();
    });
  });
});
