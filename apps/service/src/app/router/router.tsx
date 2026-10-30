import { createBrowserRouter, type RouteObject } from 'react-router';

import { MapHomePage } from '@/views/map-home';
import { NeighborhoodPage } from '@/views/neighborhood';
import { NotFoundPage } from '@/views/not-found';
import { OnboardingPage } from '@/views/onboarding';
import { PlaceDetailPage } from '@/views/place-detail';

export const routes: RouteObject[] = [
  { path: '/', Component: OnboardingPage },
  { path: '/neighborhood', Component: NeighborhoodPage },
  {
    path: '/map',
    Component: MapHomePage,
    children: [{ path: 'place/:id', Component: PlaceDetailPage }],
  },
  { path: '*', Component: NotFoundPage },
];

export const router = createBrowserRouter(routes);
