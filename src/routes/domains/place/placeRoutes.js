import { lazy } from 'react';
import PlaceLayout from '@/layouts/PlaceLayout';
import { PATHS } from '@/routes/paths';

const PlacePage = lazy(() => import('@/pages/place/PlacePage'));

export default [
  {
    layout: 'bare',
    auth: 'member',
    routes: [
      {
        Component: PlaceLayout,
        children: [{ path: PATHS.PLACES, Component: PlacePage }],
      },
    ],
  },
];
