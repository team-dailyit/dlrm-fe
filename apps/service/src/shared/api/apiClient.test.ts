import { afterEach, describe, expect, it, test, vi } from 'vitest';

import { createApiClient } from './apiClient';
import { ApiError, NetworkError } from './errors';

const BASE_URL = 'https://api.test';
const REQUEST_TIMEOUT_MS = 10_000;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

// 실제 네트워크 요청을 없애기 위해 fetch는 Mock으로 주입합니다
function setupClient(responses: Array<Response | Error>) {
  const fetchMock = vi.fn<typeof fetch>();
  responses.forEach((response) => {
    if (response instanceof Error) {
      fetchMock.mockRejectedValueOnce(response);
    } else {
      fetchMock.mockResolvedValueOnce(response);
    }
  });
  const client = createApiClient({ baseUrl: BASE_URL, fetch: fetchMock });

  return { client, fetchMock };
}

function requestedUrl(fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) {
  return (fetchMock.mock.calls[0][0] as Request).url;
}

describe('apiClient', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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
        expect(requestedUrl(fetchMock)).toBe(
          `${BASE_URL}/api/places/nearby?radius=500`,
        );
      });
    });

    describe('에러 응답을 받았을 때', () => {
      test.each([
        ['4xx', 404],
        ['5xx', 503],
      ])(
        '%s이면 재시도하지 않고 상태 코드를 담은 ApiError를 던집니다',
        async (_label, status) => {
          const { client, fetchMock } = setupClient([jsonResponse({}, status)]);

          const error = await client
            .get('/api/places/unknown')
            .catch((e: unknown) => e);

          expect(error).toBeInstanceOf(ApiError);
          expect(error).toMatchObject({ status });
          expect(fetchMock).toHaveBeenCalledTimes(1);
        },
      );
    });

    describe('네트워크 오류가 났을 때', () => {
      it('재시도하지 않고 NetworkError를 던집니다', async () => {
        const { client, fetchMock } = setupClient([
          new TypeError('Failed to fetch'),
        ]);

        await expect(client.get('/api/neighborhoods')).rejects.toBeInstanceOf(
          NetworkError,
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('응답이 제한 시간 안에 오지 않을 때', () => {
      it('NetworkError를 던집니다', async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn<typeof fetch>(
          () => new Promise<Response>(() => undefined),
        );
        const client = createApiClient({ baseUrl: BASE_URL, fetch: fetchMock });

        const result = client
          .get('/api/neighborhoods')
          .catch((e: unknown) => e);
        await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

        expect(await result).toBeInstanceOf(NetworkError);
      });
    });

    describe('200 응답의 본문을 JSON으로 읽지 못했을 때', () => {
      it('SyntaxError를 그대로 던집니다', async () => {
        const { client } = setupClient([
          new Response('not json', { status: 200 }),
        ]);

        await expect(client.get('/api/neighborhoods')).rejects.toBeInstanceOf(
          SyntaxError,
        );
      });
    });

    describe('좌표 쿼리가 포함된 요청이 실패했을 때', () => {
      const COORDINATES = { lat: 37.5445, lng: 127.056 };

      function expectNoCoordinates(text: string) {
        expect(text).not.toContain('37.5445');
        expect(text).not.toContain('127.056');
      }

      test.each([
        ['4xx 응답', jsonResponse({}, 400)],
        ['5xx 응답', jsonResponse({}, 500)],
        ['네트워크 오류', new TypeError('Failed to fetch')],
      ])(
        '%s의 에러 메시지에 좌표 값을 남기지 않습니다',
        async (_label, failure) => {
          const { client } = setupClient([failure]);

          const error = await client
            .get('/api/places/nearby', COORDINATES)
            .catch((e: Error) => e);

          expect(error).toBeInstanceOf(Error);
          expectNoCoordinates((error as Error).message);
        },
      );

      it('네트워크 오류 원인(cause)에도 좌표 값을 남기지 않습니다', async () => {
        const { client } = setupClient([new TypeError('Failed to fetch')]);

        const error = await client
          .get('/api/places/nearby', COORDINATES)
          .catch((e: Error) => e);

        expectNoCoordinates(String(((error as Error).cause as Error).message));
      });
    });
  });
});
