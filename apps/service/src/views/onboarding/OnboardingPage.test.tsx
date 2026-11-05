import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import OnboardingPage from './OnboardingPage';

describe('OnboardingPage', () => {
  it('"동네 직접 고르기" 링크는 동네 고르기 화면(/neighborhood)을 가리킵니다', () => {
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: '동네 직접 고르기' }),
    ).toHaveAttribute('href', '/neighborhood');
  });
});
