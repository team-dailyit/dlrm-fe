import ky, { isHTTPError, isNetworkError, isTimeoutError } from 'ky';

import { ApiError, NetworkError } from './errors';
import { maskCoordinates } from './maskCoordinates';

type QueryParams = Record<string, string | number | boolean | undefined>;

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type ApiClient = {
  get: <T>(path: string, params?: QueryParams) => Promise<T>;
};

// ky 에러 메시지에는 요청 URL(좌표 포함)이 실리므로 마스킹한 메시지로 바꿔 던진다
function toApiError(error: unknown): unknown {
  if (isHTTPError(error)) {
    return new ApiError(
      error.response.status,
      `${error.response.status} ${maskCoordinates(error.request.url)}`,
    );
  }

  if (isNetworkError(error) || isTimeoutError(error)) {
    return new NetworkError(
      `${maskCoordinates(error.request.url)} 요청에 응답을 받지 못했습니다`,
      { cause: new Error(maskCoordinates(error.message)) },
    );
  }

  return error;
}

export function createApiClient({
  baseUrl,
  fetch,
}: ApiClientOptions): ApiClient {
  const instance = ky.create({
    baseUrl,
    // 재시도는 React Query가 맡는다 (queryClient 참고)
    retry: 0,
    ...(fetch && { fetch }),
  });

  async function get<T>(path: string, params?: QueryParams): Promise<T> {
    try {
      return await instance.get(path, { searchParams: params }).json<T>();
    } catch (error) {
      throw toApiError(error);
    }
  }

  return { get };
}
