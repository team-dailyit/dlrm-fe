import type { Meta, StoryObj } from '@storybook/react-vite';

import markerIconUrl from '@/shared/assets/icons/marker.svg';

import Button from './Button';

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: {
    children: '위치 허용하고 시작하기',
    className: 'w-[311px]',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const WithIcon: Story = {
  args: {
    icon: <img src={markerIconUrl} alt="" width={16} height={16} />,
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
