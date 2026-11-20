import { createBrowserRouter, type RouteObject } from 'react-router';

import { ROUTE_PATHS } from '@/shared/config';
import { MapHomePage } from '@/views/map-home';
import { NeighborhoodPage } from '@/views/neighborhood';
import { NotFoundPage } from '@/views/not-found';
import { OnboardingPage } from '@/views/onboarding';
import { PlaceDetailPage } from '@/views/place-detail';

export const routes: RouteObject[] = [
  { path: ROUTE_PATHS.onboarding, Component: OnboardingPage },
  { path: ROUTE_PATHS.neighborhood, Component: NeighborhoodPage },
  {
    path: ROUTE_PATHS.mapHome,
    Component: MapHomePage,
    children: [{ path: ROUTE_PATHS.placeDetail, Component: PlaceDetailPage }],
  },
  { path: '*', Component: NotFoundPage },
];

export const router = createBrowserRouter(routes);
