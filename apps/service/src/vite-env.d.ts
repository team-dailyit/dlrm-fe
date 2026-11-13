/// <reference types="vite/client" />
/// <reference types="kakao.maps.d.ts" />

interface ImportMetaEnv {
  /** 카카오맵 JavaScript 키 */
  readonly VITE_KAKAO_MAP_APP_KEY: string;
  /** 백엔드 API 주소 (예: https://api.example.com) */
  readonly VITE_API_BASE_URL: string;
  /** "true" 이면 개발 서버에서 MSW 로 API 응답을 흉내 낸다. 백엔드 서버가 없을 때 쓴다 */
  readonly VITE_ENABLE_MSW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
