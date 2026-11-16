import { copyText } from '@/shared/lib/clipboard';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

type SharedPlace = {
  placeId: number;
  name: string;
};

// 받은 사람이 들름에서 바로 그 장소를 열도록 지금 사이트 주소 기준으로 장소 상세 주소를 만든다
function toPlaceDetailUrl(placeId: number): string {
  return new URL(`/map/place/${placeId}`, window.location.origin).href;
}

/*
 * 기기 공유 창으로 장소를 공유한다. 공유 창이 없는 브라우저(주로 데스크톱)에서는 장소 상세 주소를 복사한다.
 * 사용자가 공유 창을 닫은 것은 의도한 동작이라 복사로 넘어가지 않는다
 */
export async function sharePlace({
  placeId,
  name,
}: SharedPlace): Promise<ShareResult> {
  const url = toPlaceDetailUrl(placeId);

  if (typeof navigator.share !== 'function') {
    return copyText(url);
  }
  try {
    await navigator.share({ title: name, url });
    return 'shared';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }
    return 'failed';
  }
}
