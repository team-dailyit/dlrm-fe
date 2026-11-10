/// <reference types="vite/client" />
/// <reference types="kakao.maps.d.ts" />

interface ImportMetaEnv {
  /** 카카오맵 JavaScript 키. 값은 .env.local 에 두고 커밋하지 않는다. */
  readonly VITE_KAKAO_MAP_APP_KEY: string;
  /** 백엔드 API 주소 (예: https://api.example.com) */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
