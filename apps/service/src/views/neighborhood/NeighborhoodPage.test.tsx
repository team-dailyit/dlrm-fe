import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';

import { neighborhoodsHandler } from '@/entities/neighborhood/api/neighborhoodHandlers';
import { useReferencePointStore } from '@/entities/reference-point';
import { createQueryClient } from '@/shared/api';
import { mockServer } from '@/shared/testing/mockServer';

import NeighborhoodPage from './NeighborhoodPage';

type User = ReturnType<typeof userEvent.setup>;

const SEONGSU_ID = 1_000_000_000_001;
const ANGUK_ID = 1_000_000_000_003;
const HONGDAE_ID = 1_000_000_000_004;
const UNKNOWN_ID = 9_999_999_999_999;

// 동네 고르기 화면을 띄우고, 확인 후 이동했는지 알 수 있도록 지도 홈 자리에 제목만 둡니다
function renderNeighborhoodPage() {
  const router = createMemoryRouter(
    [
      { path: '/neighborhood', element: <NeighborhoodPage /> },
      { path: '/map', element: <h1>지도 홈</h1> },
    ],
    { initialEntries: ['/neighborhood'] },
  );
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router, user: userEvent.setup() };
}

function findNeighborhoodOption(name: string) {
  return screen.findByRole('radio', { name });
}

function getConfirmButton() {
  return screen.getByRole('button', { name: '확인' });
}

async function chooseNeighborhood(user: User, name: string) {
  await user.click(await findNeighborhoodOption(name));
}

async function pressConfirm(user: User) {
  await user.click(getConfirmButton());
}

function getSavedReferencePoint() {
  return useReferencePointStore.getState().referencePoint;
}

// 테스트끼리 기준점이 남지 않도록 스토어와 저장소를 초기화하고, 동네 API가 서비스 동네 4곳을 응답하도록 MSW 핸들러를 등록합니다
beforeEach(() => {
  useReferencePointStore.getState().reset();
  sessionStorage.clear();
  localStorage.clear();
  mockServer.use(neighborhoodsHandler);
});

describe('NeighborhoodPage', () => {
  describe('처음 들어왔을 때', () => {
    it.each(['성수', '강남', '안국', '홍대'])(
      '동네 API가 준 %s 동네를 선택지로 보여줍니다',
      async (name) => {
        renderNeighborhoodPage();

        expect(await findNeighborhoodOption(name)).toBeInTheDocument();
      },
    );

    it('아무 동네도 고르지 않아 확인 버튼을 누를 수 없습니다', async () => {
      renderNeighborhoodPage();
      await findNeighborhoodOption('성수');

      expect(getConfirmButton()).toBeDisabled();
    });
  });

  describe('이미 기준점이 저장되어 있을 때', () => {
    it('저장된 동네가 선택된 상태로 시작해 바로 확인할 수 있습니다', async () => {
      useReferencePointStore.getState().selectNeighborhood(ANGUK_ID);

      renderNeighborhoodPage();

      expect(await findNeighborhoodOption('안국')).toBeChecked();
      expect(getConfirmButton()).toBeEnabled();
    });

    it.each<[string, () => void]>([
      [
        '현재 위치 기준이면',
        () =>
          useReferencePointStore
            .getState()
            .selectCurrentLocation({ lat: 37.5445, lng: 127.056 }),
      ],
      [
        '저장된 동네 코드가 목록에 없으면',
        () => useReferencePointStore.getState().selectNeighborhood(UNKNOWN_ID),
      ],
    ])(
      '%s 아무 동네도 선택하지 않습니다',
      async (_label, saveReferencePoint) => {
        saveReferencePoint();

        renderNeighborhoodPage();
        await findNeighborhoodOption('성수');

        expect(screen.queryByRole('radio', { checked: true })).toBeNull();
        expect(getConfirmButton()).toBeDisabled();
      },
    );
  });

  describe('동네를 골랐을 때', () => {
    it('고른 동네가 선택되고 확인 버튼을 누를 수 있습니다', async () => {
      const { user } = renderNeighborhoodPage();

      await chooseNeighborhood(user, '성수');

      expect(await findNeighborhoodOption('성수')).toBeChecked();
      expect(getConfirmButton()).toBeEnabled();
    });
  });

  describe('확인 버튼을 눌렀을 때', () => {
    it('고른 동네를 기준점으로 저장하고 지도 홈으로 이동합니다', async () => {
      const { router, user } = renderNeighborhoodPage();

      await chooseNeighborhood(user, '성수');
      await pressConfirm(user);

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: SEONGSU_ID,
      });
      expect(router.state.location.pathname).toBe('/map');
    });

    it('동네를 바꿔 고른 뒤 확인하면 마지막에 고른 동네를 저장합니다', async () => {
      const { user } = renderNeighborhoodPage();

      await chooseNeighborhood(user, '성수');
      await chooseNeighborhood(user, '홍대');
      await pressConfirm(user);

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: HONGDAE_ID,
      });
    });
  });
});
