import './styles/index.scss';

import { RouterProvider } from 'react-router';

import Providers from './Providers';
import { router } from './router';

export const App = () => {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};
