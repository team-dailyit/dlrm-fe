import '../src/app/styles/index.scss';

import type { Preview } from '@storybook/react-vite';

// GR-05: 뷰포트 360px 기준으로 설계하므로 모바일 뷰포트를 기본으로 보여줍니다.
const preview: Preview = {
  parameters: {
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
