import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type KakaoGlobal = {
  kakao?: { maps: { load: (callback: () => void) => void } };
};

const getScripts = () =>
  document.head.querySelectorAll<HTMLScriptElement>(
    'script[src*="dapi.kakao.com"]',
  );

// 실제 SDK를 받지 않기 위해 kakao.maps.load를 mock으로 대신합니다. 콜백을 붙잡아 두어 SDK 초기화가 끝나는 시점을 테스트에서 정합니다
const kakaoMapsLoadMock = vi.fn<(callback: () => void) => void>();

function finishKakaoMapsLoad() {
  const [[callback]] = kakaoMapsLoadMock.mock.calls;
  callback();
}

let loadKakaoMap: typeof import('./loadKakaoMap').loadKakaoMap;

// loadKakaoMap은 모듈 안에 로드 상태를 들고 있어서, 테스트마다 모듈을 새로 불러오고 앱 키와 kakao 전역을 준비합니다
beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('VITE_KAKAO_MAP_APP_KEY', 'test-key');
  (globalThis as KakaoGlobal).kakao = { maps: { load: kakaoMapsLoadMock } };
  ({ loadKakaoMap } = await import('./loadKakaoMap'));
});

// 다음 테스트에 앱 키, kakao 전역, 삽입한 스크립트가 남지 않도록 지웁니다
afterEach(() => {
  vi.unstubAllEnvs();
  kakaoMapsLoadMock.mockReset();
  delete (globalThis as KakaoGlobal).kakao;
  document.head.innerHTML = '';
});

describe('loadKakaoMap', () => {
  describe('처음 호출했을 때', () => {
    it('앱 키와 autoload=false를 붙인 SDK 스크립트를 넣습니다', () => {
      void loadKakaoMap();

      const [script] = getScripts();
      expect(script.src).toContain('appkey=test-key');
      expect(script.src).toContain('autoload=false');
    });
  });

  describe('SDK 스크립트를 불러온 뒤', () => {
    it('kakao.maps.load가 끝나야 resolve합니다', async () => {
      const onResolveMock = vi.fn();

      void loadKakaoMap().then(onResolveMock);
      getScripts()[0].onload?.(new Event('load'));
      await Promise.resolve();
      expect(onResolveMock).not.toHaveBeenCalled();

      finishKakaoMapsLoad();
      await vi.waitFor(() => expect(onResolveMock).toHaveBeenCalledOnce());
    });
  });

  describe('SDK 스크립트를 불러왔지만 kakao.maps를 쓸 수 없을 때', () => {
    it.each<[string, () => void]>([
      [
        'kakao 전역이 없으면',
        () => {
          delete (globalThis as KakaoGlobal).kakao;
        },
      ],
      [
        'kakao.maps.load가 예외를 던지면',
        () => {
          kakaoMapsLoadMock.mockImplementation(() => {
            throw new Error('init failed');
          });
        },
      ],
    ])(
      '%s reject하고 실패한 스크립트를 지운 뒤, 다음 호출에서 다시 시도합니다',
      async (_label, breakKakaoMaps) => {
        breakKakaoMaps();

        const failed = loadKakaoMap();
        getScripts()[0].onload?.(new Event('load'));
        await expect(failed).rejects.toThrow('로드에 실패');
        expect(getScripts()).toHaveLength(0);

        void loadKakaoMap();
        expect(getScripts()).toHaveLength(1);
      },
    );
  });

  describe('로드가 끝난 뒤 다시 호출했을 때', () => {
    it('스크립트를 다시 넣지 않고 같은 Promise를 돌려줍니다', async () => {
      const loaded = loadKakaoMap();
      getScripts()[0].onload?.(new Event('load'));
      finishKakaoMapsLoad();
      await loaded;

      expect(loadKakaoMap()).toBe(loaded);
      expect(getScripts()).toHaveLength(1);
    });
  });

  describe('여러 번 호출했을 때', () => {
    it('스크립트는 한 번만 넣고 같은 Promise를 돌려줍니다', () => {
      const first = loadKakaoMap();
      const second = loadKakaoMap();

      expect(first).toBe(second);
      expect(getScripts()).toHaveLength(1);
    });
  });

  describe('로드에 실패했을 때', () => {
    it('reject하고 실패한 스크립트를 지운 뒤, 다음 호출에서 다시 시도합니다', async () => {
      const failed = loadKakaoMap();
      getScripts()[0].onerror?.(new Event('error'));
      await expect(failed).rejects.toThrow('로드에 실패');
      expect(getScripts()).toHaveLength(0);

      void loadKakaoMap();
      expect(getScripts()).toHaveLength(1);
    });
  });

  describe('앱 키가 없을 때', () => {
    it('스크립트를 넣지 않고 reject합니다', async () => {
      vi.stubEnv('VITE_KAKAO_MAP_APP_KEY', '');

      await expect(loadKakaoMap()).rejects.toThrow('VITE_KAKAO_MAP_APP_KEY');
      expect(getScripts()).toHaveLength(0);
    });
  });
});
