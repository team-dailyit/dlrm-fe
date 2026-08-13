/// <reference types="vite/client" />
/// <reference types="kakao.maps.d.ts" />

interface ImportMetaEnv {
  /** 카카오맵 JavaScript 키. 값은 .env.local 에 두고 커밋하지 않습니다. */
  readonly VITE_KAKAO_MAP_APP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
