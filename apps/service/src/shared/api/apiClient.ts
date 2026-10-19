import { ApiError, RetryExhaustedError } from './errors';
import { maskCoordinates } from './maskCoordinates';

export const MAX_RETRY_COUNT = 3;
// 재시도 대기 시간은 RETRY_BASE_DELAY_MS 에서 시작해 재시도마다 2배씩 늘어난다 (300, 600, 1200ms)
const RETRY_BASE_DELAY_MS = 300;
const SERVER_ERROR_STATUS = 500;

type QueryParams = Record<string, string | number | boolean | undefined>;

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
};

export type ApiClient = {
  get: <T>(path: string, params?: QueryParams) => Promise<T>;
};

function buildUrl(baseUrl: string, path: string, params?: QueryParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();

  return `${baseUrl}${path}${query ? `?${query}` : ''}`;
}

const defaultWait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// 런타임에 따라 fetch 에러 메시지에 URL(좌표 포함)이 실릴 수 있어 마스킹한 사본만 원인으로 남긴다
function toMaskedError(error: unknown) {
  return new Error(
    maskCoordinates(error instanceof Error ? error.message : String(error)),
  );
}

export function createApiClient({
  baseUrl,
  // fetch 를 메서드처럼 분리해 호출하면 Illegal invocation 이 나므로 감싸서 호출한다
  fetch: fetchImpl = (...args) => fetch(...args),
  wait = defaultWait,
}: ApiClientOptions): ApiClient {
  async function get<T>(path: string, params?: QueryParams): Promise<T> {
    const url = buildUrl(baseUrl, path, params);
    const maskedUrl = maskCoordinates(url);
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRY_COUNT; attempt += 1) {
      if (attempt > 0) {
        await wait(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }

      let response: Response;
      try {
        response = await fetchImpl(url);
      } catch (error) {
        lastError = toMaskedError(error);
        continue;
      }

      if (response.ok) {
        // 본문 파싱 실패는 재시도해도 같은 결과이므로 재시도 루프 밖으로 그대로 전달한다
        return (await response.json()) as T;
      }

      const apiError = new ApiError(
        response.status,
        `${response.status} ${maskedUrl}`,
      );
      if (response.status < SERVER_ERROR_STATUS) {
        throw apiError;
      }
      lastError = apiError;
    }

    throw new RetryExhaustedError(
      `${maskedUrl} 요청이 ${MAX_RETRY_COUNT}회 재시도 후에도 실패했습니다`,
      {
        cause: lastError,
      },
    );
  }

  return { get };
}
