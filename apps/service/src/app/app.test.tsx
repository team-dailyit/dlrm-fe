import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  it('오류 없이 렌더된다', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
