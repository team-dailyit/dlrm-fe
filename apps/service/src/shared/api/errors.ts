export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, message: string, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const NOT_FOUND_STATUS = 404;

// 서버가 대상을 찾지 못했다(404). 화면이 일반 오류와 나눠 "없는 대상" 안내를 보여줄 때 쓴다
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND_STATUS;
}

export class NetworkError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'NetworkError';
  }
}
