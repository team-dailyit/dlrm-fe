import ky, { isHTTPError, isNetworkError, isTimeoutError } from 'ky';

import { ApiError, NetworkError } from './errors';
import { maskCoordinates } from './maskCoordinates';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface ErrorResponseBody {
  code: string;
  message: string;
}

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type ApiClient = {
  get: <T>(path: string, params?: QueryParams) => Promise<T>;
};
function isErrorResponseBody(body: unknown): body is ErrorResponseBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof body.code === 'string' &&
    'message' in body &&
    typeof body.message === 'string'
  );
}

async function toApiError(error: unknown): Promise<unknown> {
  if (isHTTPError(error)) {
    const body: unknown = await error.data;

    const { code, message } = isErrorResponseBody(body)
      ? body
      : {
          code: 'UNKNOWN',
          message: `${error.response.status} ${maskCoordinates(error.request.url)}`,
        };

    return new ApiError(error.response.status, message, code);
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
    retry: 0,
    ...(fetch && { fetch }),
  });

  async function get<T>(path: string, params?: QueryParams): Promise<T> {
    try {
      return await instance.get(path, { searchParams: params }).json<T>();
    } catch (error) {
      throw await toApiError(error);
    }
  }

  return { get };
}
