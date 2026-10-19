import type { StorybookConfig } from '@storybook/react-vite';

// vite.config.ts 를 그대로 물려받으므로 `@` alias 등 앱 설정이 스토리에도 적용됩니다.
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
};

export default config;
