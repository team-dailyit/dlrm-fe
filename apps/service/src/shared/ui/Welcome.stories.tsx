import type { Meta, StoryObj } from '@storybook/react-vite';

// Storybook 동작 확인용 예시 스토리입니다. 실제 공통 컴포넌트 스토리가 생기면 지워도 됩니다.
function Welcome() {
  return <p>들름 Storybook</p>;
}

const meta = {
  title: 'Shared/Welcome',
  component: Welcome,
} satisfies Meta<typeof Welcome>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
