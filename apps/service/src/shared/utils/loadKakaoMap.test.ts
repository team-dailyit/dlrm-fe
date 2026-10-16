import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type KakaoGlobal = {
  kakao?: { maps: { load: (callback: () => void) => void } };
};

const getScripts = () =>
  document.head.querySelectorAll<HTMLScriptElement>(
    'script[src*="dapi.kakao.com"]',
  );

describe('loadKakaoMap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_KAKAO_MAP_APP_KEY', 'test-key');
    (globalThis as KakaoGlobal).kakao = {
      maps: { load: (callback) => callback() },
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as KakaoGlobal).kakao;
    document.head.innerHTML = '';
  });

  it('autoload=false 로 SDK 스크립트를 넣고, 로드가 끝나면 resolve 한다', async () => {
    const { loadKakaoMap } = await import('./loadKakaoMap');

    const promise = loadKakaoMap();
    const [script] = getScripts();
    expect(script.src).toContain('appkey=test-key');
    expect(script.src).toContain('autoload=false');

    script.onload?.(new Event('load'));
    await expect(promise).resolves.toBeUndefined();
  });

  it('여러 번 호출해도 스크립트는 한 번만 넣는다', async () => {
    const { loadKakaoMap } = await import('./loadKakaoMap');

    const first = loadKakaoMap();
    const second = loadKakaoMap();

    expect(first).toBe(second);
    expect(getScripts()).toHaveLength(1);
  });

  it('로드에 실패하면 reject 하고, 다음 호출에서 다시 시도한다', async () => {
    const { loadKakaoMap } = await import('./loadKakaoMap');

    const failed = loadKakaoMap();
    getScripts()[0].onerror?.(new Event('error'));
    await expect(failed).rejects.toThrow('로드에 실패');

    loadKakaoMap();
    expect(getScripts()).toHaveLength(1);
  });

  it('앱 키가 없으면 스크립트를 넣지 않고 reject 한다', async () => {
    vi.stubEnv('VITE_KAKAO_MAP_APP_KEY', '');
    const { loadKakaoMap } = await import('./loadKakaoMap');

    await expect(loadKakaoMap()).rejects.toThrow('VITE_KAKAO_MAP_APP_KEY');
    expect(getScripts()).toHaveLength(0);
  });
});
