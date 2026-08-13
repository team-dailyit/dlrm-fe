import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('Home', () => {
  it('오류 없이 렌더된다', () => {
    expect(() => render(<Home />)).not.toThrow();
  });
});
