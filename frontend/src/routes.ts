import { route } from 'react-router-typesafe-routes';

export const ROUTES = {
    ROOT: route({ path: '' }),
    LOGIN: route({ path: 'login' }),
    MAP: route({ path: 'map' }),
} as const;

export type AppRoutes = typeof ROUTES;
