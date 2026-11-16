import { afterEach, describe, expect, it, vi } from 'vitest';

import { copyText } from './copyText';

const ADDRESS = '서울 성동구 연무장7길 10';

// jsdom에는 Clipboard API가 없어서, 클립보드에 쓰는 동작을 mock으로 대신한다
const writeTextMock = vi.fn<Clipboard['writeText']>();

function setupClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  });
}

// 다음 테스트에 navigator stub과 mock 동작이 남지 않도록 지운다
afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
  writeTextMock.mockReset();
});

describe('copyText', () => {
  describe('클립보드에 쓸 수 있을 때', () => {
    it('글자를 클립보드에 복사하고 copied를 돌려줍니다', async () => {
      setupClipboard();
      writeTextMock.mockResolvedValue();

      await expect(copyText(ADDRESS)).resolves.toBe('copied');
      expect(writeTextMock).toHaveBeenCalledWith(ADDRESS);
    });
  });

  describe('클립보드에 쓰지 못할 때', () => {
    it('권한이 거부되어 쓰기에 실패하면 failed를 돌려줍니다', async () => {
      setupClipboard();
      writeTextMock.mockRejectedValue(new DOMException('', 'NotAllowedError'));

      await expect(copyText(ADDRESS)).resolves.toBe('failed');
    });

    it('Clipboard API를 지원하지 않는 브라우저면 failed를 돌려줍니다', async () => {
      await expect(copyText(ADDRESS)).resolves.toBe('failed');
    });
  });
});
