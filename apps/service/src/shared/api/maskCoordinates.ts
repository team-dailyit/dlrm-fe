const COORDINATE_QUERY_PATTERN = /([?&](?:lat|lng)=)[^&#]*/g;

// 기획서 GR-03: 위치 좌표는 조회 파라미터로만 쓰고 저장·로깅하지 않는다. 로그와 에러 메시지에는 마스킹한 URL만 남긴다.
export function maskCoordinates(url: string): string {
  return url.replace(COORDINATE_QUERY_PATTERN, '$1***');
}
