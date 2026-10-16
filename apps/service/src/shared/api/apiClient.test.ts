import { describe, expect, it, test, vi } from 'vitest';

import { createApiClient, MAX_RETRY_COUNT } from './apiClient';
import { ApiError, RetryExhaustedError } from './errors';

const BASE_URL = 'https://api.test';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function failedResponses(count: number, status = 500) {
  return Array.from({ length: count }, () => jsonResponse({}, status));
}

// 실제 네트워크 요청과 대기 시간을 없애기 위해 fetch는 Mock, wait는 Stub으로 주입합니다
function setupClient(responses: Array<Response | Error>) {
  const fetchMock = vi.fn<typeof fetch>();
  responses.forEach((response) => {
    if (response instanceof Error) {
      fetchMock.mockRejectedValueOnce(response);
    } else {
      fetchMock.mockResolvedValueOnce(response);
    }
  });
  const waitStub = vi.fn<(ms: number) => Promise<void>>(() =>
    Promise.resolve(),
  );
  const client = createApiClient({
    baseUrl: BASE_URL,
    fetch: fetchMock,
    wait: waitStub,
  });

  return { client, fetchMock, waitStub };
}

describe('apiClient', () => {
  describe('get', () => {
    describe('요청에 성공했을 때', () => {
      it('baseUrl과 쿼리 파라미터를 붙여 요청하고 JSON 응답을 반환합니다', async () => {
        const { client, fetchMock } = setupClient([
          jsonResponse([{ id: 'place-1' }]),
        ]);

        const result = await client.get('/api/places/nearby', {
          radius: 500,
          category: undefined,
        });

        expect(result).toEqual([{ id: 'place-1' }]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0][0])).toBe(
          `${BASE_URL}/api/places/nearby?radius=500`,
        );
      });

      it('재시도가 없으면 대기하지 않습니다', async () => {
        const { client, waitStub } = setupClient([jsonResponse({ ok: true })]);

        await client.get('/api/neighborhoods');

        expect(waitStub).not.toHaveBeenCalled();
      });
    });

    describe('4xx 응답을 받았을 때', () => {
      it('재시도하지 않고 상태 코드를 담은 ApiError를 던집니다', async () => {
        const { client, fetchMock } = setupClient([jsonResponse({}, 404)]);

        const error = await client
          .get('/api/places/unknown')
          .catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ status: 404 });
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      it('에러 메시지에 좌표 값을 남기지 않습니다', async () => {
        const { client } = setupClient([jsonResponse({}, 400)]);

        const error = await client
          .get('/api/places/nearby', { lat: 37.5445, lng: 127.056 })
          .catch((e: Error) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect((error as Error).message).not.toContain('37.5445');
        expect((error as Error).message).not.toContain('127.056');
      });
    });

    describe('200 응답의 본문을 JSON으로 읽지 못했을 때', () => {
      it('재시도하지 않고 바로 에러를 던집니다', async () => {
        const { client, fetchMock } = setupClient([
          new Response('not json', { status: 200 }),
        ]);

        await expect(client.get('/api/neighborhoods')).rejects.toBeInstanceOf(
          SyntaxError,
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('재시도 대상 오류 뒤에 성공 응답을 받았을 때', () => {
      test.each([
        ['5xx 응답', jsonResponse({}, 503)],
        ['네트워크 오류', new TypeError('Failed to fetch')],
      ])(
        '%s이면 자동으로 재시도해 성공한 응답을 반환합니다',
        async (_label, failure) => {
          const { client, fetchMock } = setupClient([
            failure,
            jsonResponse({ ok: true }),
          ]);

          const result = await client.get('/api/neighborhoods');

          expect(result).toEqual({ ok: true });
          expect(fetchMock).toHaveBeenCalledTimes(2);
        },
      );
    });

    describe(`계속 실패해 재시도가 ${MAX_RETRY_COUNT}회를 넘었을 때`, () => {
      it(`최초 요청 이후 ${MAX_RETRY_COUNT}회까지만 재시도하고 RetryExhaustedError를 던집니다`, async () => {
        const { client, fetchMock } = setupClient(
          failedResponses(MAX_RETRY_COUNT + 1),
        );

        await expect(client.get('/api/neighborhoods')).rejects.toBeInstanceOf(
          RetryExhaustedError,
        );
        expect(fetchMock).toHaveBeenCalledTimes(MAX_RETRY_COUNT + 1);
      });

      it('재시도 직전에만 지수 간격(300, 600, 1200ms)으로 대기합니다', async () => {
        const { client, waitStub } = setupClient(
          failedResponses(MAX_RETRY_COUNT + 1),
        );

        await client.get('/api/neighborhoods').catch(() => undefined);

        expect(waitStub.mock.calls.map(([ms]) => ms)).toEqual([300, 600, 1200]);
      });

      it('네트워크 오류가 계속되어도 RetryExhaustedError를 던집니다', async () => {
        const { client } = setupClient(
          Array.from(
            { length: MAX_RETRY_COUNT + 1 },
            () => new TypeError('Failed to fetch'),
          ),
        );

        await expect(client.get('/api/neighborhoods')).rejects.toBeInstanceOf(
          RetryExhaustedError,
        );
      });
    });

    describe('좌표 쿼리가 포함된 요청이 실패했을 때', () => {
      it('5xx로 소진되면 에러 메시지에 좌표 값을 남기지 않습니다', async () => {
        const { client } = setupClient(failedResponses(MAX_RETRY_COUNT + 1));

        const error = await client
          .get('/api/places/nearby', { lat: 37.5445, lng: 127.056 })
          .catch((e: Error) => e);

        expect(error).toBeInstanceOf(RetryExhaustedError);
        expect((error as Error).message).not.toContain('37.5445');
        expect((error as Error).message).not.toContain('127.056');
      });

      it('네트워크 오류 원인(cause)에도 좌표 값을 남기지 않습니다', async () => {
        const leakyError = new TypeError(
          'fetch failed: /api/places/nearby?lat=37.5445&lng=127.056',
        );
        const { client } = setupClient(
          Array.from({ length: MAX_RETRY_COUNT + 1 }, () => leakyError),
        );

        const error = await client
          .get('/api/places/nearby', { lat: 37.5445, lng: 127.056 })
          .catch((e: Error) => e);

        const causeMessage = String(((error as Error).cause as Error).message);
        expect(causeMessage).not.toContain('37.5445');
        expect(causeMessage).not.toContain('127.056');
      });
    });
  });
});
