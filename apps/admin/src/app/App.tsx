import './styles/index.css';

import { RouterProvider } from 'react-router';

import Providers from './Providers';
import { router } from './router';

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
