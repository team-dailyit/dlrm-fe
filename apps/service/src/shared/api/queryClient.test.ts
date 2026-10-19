import { describe, expect, it } from 'vitest';

import { createQueryClient } from './queryClient';

describe('createQueryClient', () => {
  it('apiClient와 재시도가 중복되지 않도록 쿼리 재시도를 끕니다', () => {
    const queryClient = createQueryClient();

    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });
});
