/**
 * API 경로의 전체 주소를 만든다. MSW 핸들러가 apiClient 와 같은 주소를 기다리도록 쓴다.
 * apiClient(ky)처럼 VITE_API_BASE_URL 을 지금 페이지 주소 기준으로 먼저 풀어, 상대 경로(/api)나 빈 값도 같은 결과가 되게 한다
 */
export function toApiUrl(path: string): string {
  const baseUrl = new URL(
    import.meta.env.VITE_API_BASE_URL || '/',
    window.location.href,
  );

  return new URL(path, baseUrl).href;
}
