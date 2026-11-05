import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Button from './Button';

describe('Button', () => {
  it.each([
    ['지정하지 않으면 폼 제출을 막도록', 'button', undefined],
    ['submit으로 지정하면 그대로', 'submit', 'submit'],
  ] as const)('type을 %s type="%s"로 렌더합니다', (_, expected, type) => {
    render(<Button type={type}>시작하기</Button>);

    expect(screen.getByRole('button', { name: '시작하기' })).toHaveAttribute(
      'type',
      expected,
    );
  });
});
