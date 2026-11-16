import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sharePlace } from './sharePlace';

const PLACE = { placeId: 9_000_000_000_101, name: '슈퍼마리오 스페셜 팝업' };
const PLACE_DETAIL_URL = `${window.location.origin}/map/place/9000000000101`;

// jsdom에는 Web Share API와 Clipboard API가 없어서, 공유 창과 클립보드 쓰기를 mock으로 대신한다
const shareMock = vi.fn<Navigator['share']>();
const writeTextMock = vi.fn<Clipboard['writeText']>();

function setupShare() {
  Object.defineProperty(navigator, 'share', {
    value: shareMock,
    configurable: true,
  });
}

// 기기 공유를 지원하지 않을 때 링크 복사로 넘어가는지 보기 위해 클립보드는 항상 쓸 수 있게 둔다
beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  });
  writeTextMock.mockResolvedValue();
});

// 다음 테스트에 navigator stub과 mock 동작이 남지 않도록 지운다
afterEach(() => {
  Reflect.deleteProperty(navigator, 'share');
  Reflect.deleteProperty(navigator, 'clipboard');
  shareMock.mockReset();
  writeTextMock.mockReset();
});

describe('sharePlace', () => {
  describe('기기 공유를 지원할 때', () => {
    beforeEach(() => {
      setupShare();
    });

    it('장소 이름과 들름 장소 상세 주소로 공유 창을 열고 shared를 돌려줍니다', async () => {
      shareMock.mockResolvedValue();

      await expect(sharePlace(PLACE)).resolves.toBe('shared');
      expect(shareMock).toHaveBeenCalledWith({
        title: PLACE.name,
        url: PLACE_DETAIL_URL,
      });
    });

    it('사용자가 공유 창을 닫으면 링크를 복사하지 않고 cancelled를 돌려줍니다', async () => {
      shareMock.mockRejectedValue(new DOMException('', 'AbortError'));

      await expect(sharePlace(PLACE)).resolves.toBe('cancelled');
      expect(writeTextMock).not.toHaveBeenCalled();
    });

    it('공유 창을 열지 못하면 failed를 돌려줍니다', async () => {
      shareMock.mockRejectedValue(new DOMException('', 'NotAllowedError'));

      await expect(sharePlace(PLACE)).resolves.toBe('failed');
    });
  });

  describe('기기 공유를 지원하지 않을 때', () => {
    it('들름 장소 상세 주소를 클립보드에 복사하고 copied를 돌려줍니다', async () => {
      await expect(sharePlace(PLACE)).resolves.toBe('copied');
      expect(writeTextMock).toHaveBeenCalledWith(PLACE_DETAIL_URL);
    });
  });
});
