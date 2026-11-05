import '../src/app/styles/index.scss';

import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        dlrmMobile: {
          name: '들름 모바일 (360px)',
          styles: { width: '360px', height: '800px' },
          type: 'mobile',
        },
      },
    },
  },
  initialGlobals: {
    viewport: { value: 'dlrmMobile', isRotated: false },
  },
};

export default preview;
