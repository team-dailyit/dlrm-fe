const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

let loadPromise: Promise<void> | null = null;

/**
 * 카카오맵 SDK 를 한 번만 불러오고, `kakao.maps` 를 쓸 수 있을 때 resolve 합니다.
 * 실패하면 다음 호출에서 다시 시도할 수 있습니다. (EC-07)
 */
export function loadKakaoMap(): Promise<void> {
  if (loadPromise) return loadPromise;

  const promise = new Promise<void>((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
    if (!appKey) {
      reject(new Error('VITE_KAKAO_MAP_APP_KEY 가 설정되지 않았습니다.'));
      return;
    }

    const script = document.createElement('script');
    script.src = `${SDK_URL}?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => kakao.maps.load(() => resolve());
    script.onerror = () => {
      script.remove();
      reject(new Error('카카오맵 SDK 로드에 실패했습니다.'));
    };
    document.head.appendChild(script);
  });

  loadPromise = promise;
  promise.catch(() => {
    loadPromise = null;
  });

  return promise;
}
