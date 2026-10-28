import { route, union } from 'react-router-typesafe-routes';

export const MAP_RENDERERS = ['webgl', 'leaflet'] as const;
export type MapRenderer = (typeof MAP_RENDERERS)[number];

export const ROUTES = {
    ROOT: route({ path: '' }),
    LOGIN: route({ path: 'login' }),
    MAP: route({ path: 'map', searchParams: { renderer: union(MAP_RENDERERS) } }),
} as const;

export type AppRoutes = typeof ROUTES;
