# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent Yarn 4 projects (each has its own `package.json` with `packageManager: yarn@4.13.0`, `yarn.lock`, `.yarnrc.yml` with `nodeLinker: node-modules`); there is no root workspace. Run commands from inside `backend/` or `frontend/`. Each needs `cp .env.example .env` before first run. Node 22+.

- `backend/` — NestJS 11 API (port 8000, global prefix `/api`)
- `frontend/` — React 19 SPA bundled with a custom Webpack config (port 3000)

## Commands

Backend (`cd backend`):
- `yarn start:dev` — dev server with watch; Swagger UI at `http://127.0.0.1:8000/api`, OpenAPI JSON at `/api-json`
- `yarn build` / `yarn start:prod` — build goes to `dist/main.js` (`tsconfig.build.json` sets `rootDir: ./src` and keeps `tsBuildInfoFile` inside `dist`, otherwise `deleteOutDir` causes partial builds)
- `yarn lint` — ESLint **with `--fix`** (modifies files); use `npx eslint "src/**/*.ts"` to only check
- `yarn format` — Prettier
- `yarn test` — Jest (`*.spec.ts` under `src/`); single test: `yarn test path/to/file.spec.ts` or `yarn test -t "name"`. No spec files exist yet.

Frontend (`cd frontend`):
- `yarn start` — webpack-dev-server with React Fast Refresh (`react-refresh-typescript` transformer in `ts-loader`)
- `yarn build` — production bundle into `build/` (minified, no source maps, cleaned on each build)
- `yarn typecheck` — required to catch type errors: webpack uses `ts-loader` with `transpileOnly`
- `yarn orval` — regenerate the API client. **Requires the backend to be running**, since it fetches `${API_HOST}/api-json`.
- `yarn format` — Prettier
- There is no frontend lint or test setup.

`webpack.config.js` exports a function and derives production mode from `--mode`, not `NODE_ENV`. Restart `yarn start` after changing it.

Both projects share the same Prettier style: 4-space indent, single quotes, 120 columns, `arrowParens: avoid`.

## Conventions

- Don't add explanatory comments to code.
- Constants that belong to a service are `private static readonly` class fields (accessed as `ObjectsService.MOVE_INTERVAL_MS`), not module-level `const`.

## Architecture

### Backend: in-memory simulation + SSE

There is no database. `ObjectsService` (`backend/src/objects/objects.service.ts`) holds all objects in a `Map` and is effectively a simulator:
- On module init it parses the polygon from the KML file (`MAP_KML_PATH`, default `map.kml`, resolved from the working directory) using `GeojsonService`, then spawns `OBJECTS_COUNT` objects (default 150) at random points inside that polygon.
- Every `MOVE_INTERVAL_MS` (default 5 s) it moves every object (fixed speed, longitude step corrected by `cos(lat)`, small random heading changes; an object that would leave the polygon turns back instead) and publishes **one** `UPDATE_OBJECTS` event with copies of all objects.
- Every 60 s it randomly adds an object (publishes `ADD_OBJECT`) or removes one. **Removal is intentionally not published**: the client is responsible for dropping objects that stop receiving updates.
- Timers are cleared in `onModuleDestroy`.
- Events go through `PubSubService` (an RxJS `Subject` filtered by channel name). Channel names match `EventMessageKeyEnum` values.
- `ObjectsSseService` merges all `EventMessageKeyEnum` channels plus a 30 s heartbeat (`data: null`) into the `GET /api/objects/stream` SSE stream. `GET /api/objects/list` returns the current snapshot.

CORS allows only origins from `CORS_ORIGIN` (comma-separated, default `http://localhost:3000`), without credentials.

### Backend: configuration

All env vars are declared in `EnvService` (`backend/src/common/env.service.ts`): `readonly` fields with defaults as initializers, class-validator decorators for validation, comma-separated lists split by `@Transform`. The global `EnvModule` loads `.env` via `ConfigModule.forRoot()` and provides `EnvService.fromEnv(process.env)`, so startup fails on invalid values. Inject `EnvService` and read fields directly (`this.envSvc.MOVE_INTERVAL_MS`) — never `ConfigService.get`, `process.env` or hand parsing. A new variable goes into `EnvService`, `.env.example` and `backend/README.md`.

### Backend: auth

API-key auth with keys from `VALID_API_KEYS` (comma-separated env var). The flow is split in two places:
1. `AppMiddleware` (`app.middleware.ts`, applied to all routes) reads the raw `Authorization` header (the key itself, no `Bearer` prefix) and sets `req.user` if the key is valid.
2. `AuthGuard` is registered globally via `APP_GUARD` and rejects requests without `req.user` unless the handler/class is marked `@Public()`.

`@Auth()` param decorator extracts the user; `req.user` typing is augmented in `auth.types.ts`.

The global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted` + `forbidUnknownValues`, so every request DTO field needs class-validator decorators or it will be rejected.

### Contract between backend and frontend

Swagger decorators on backend DTOs/controllers are the source of truth for the frontend: Orval generates `frontend/src/api/generated.ts` (React Query hooks and plain functions) and `generated.schemas.ts` from the OpenAPI spec. Don't hand-edit those files — change the backend DTOs/decorators, run the backend, then `yarn orval`, then `yarn typecheck`.
- DTOs referenced only through `getSchemaPath` (the SSE event payloads) must be listed in `@ApiExtraModels` on `ObjectsController`, otherwise the generated schemas reference missing types.
- Generated function names derive from controller+method names (e.g. `ObjectsController.getList` → `objectsControllerGetList` / `useObjectsControllerGetList`), so renaming backend methods breaks frontend call sites.
- All generated requests go through the `axiosInstance` mutator in `frontend/src/api/axios.instance.ts`; cancellation uses the `signal` Orval passes in.

### Frontend: services via tsyringe + MobX

State and logic live in `@singleton()` service classes in `frontend/src/services/`, resolved from a tsyringe container — not in React context or component state:
- Components get services with `useService(ServiceA, ServiceB)` (from `service.base.tsx`) and must be wrapped in `observer()` to react to MobX changes.
- Services use MobX decorators (`@observable`, `@action.bound`, `@computed`) and **must** call `makeObservable(this)` in the constructor; MobX is configured with `enforceActions: 'always'`, so all mutations must happen inside actions/`runInAction`.
- Services expose React hooks as arrow-function properties (`useLogin`, `useVerify`, `useSseConnection`) that components call during render.
- `ApiService` mixes all Orval-generated functions/hooks into one injectable via `HttpServiceBase(api)`, so other services call `this.apiSvc.useXxx()` or `this.apiSvc.xxx()`.
- `queryClient` lives in `src/api/query.client.ts` so services can clear it.

Data flow on the map page (`SseService` + `ObjectsService`):
- `SseService.connect()` opens the stream with `@microsoft/fetch-event-source` (needed to send the `Authorization` header, which native `EventSource` cannot), creating a new `AbortController` per connection.
- On every successful open it calls `ObjectsService.load()`, which fetches `/objects/list` and **merges** it (never replaces: removal is client-side only).
- `UPDATE_OBJECTS` batches and `ADD_OBJECT` go through `ObjectsService.setMany()` in one action; an object is not overwritten by data with an older `updatedAt`.
- 401 on open → `AuthService.logout()` and no retries; other errors and server-side close → reconnect every 5 s.
- `ObjectsService` drops objects whose `updatedAt` is older than 5 minutes; the cleanup timer runs only while the stream is connected (`startCleanup`/`stopCleanup`).

Auth on the frontend: `AuthService` keeps `apiKey` and `status` (`'verifying' | 'authenticated' | 'anonymous'`) as observables, stores the key in `sessionStorage` and sets it as the default axios `Authorization` header. `logout()` also clears objects and the React Query cache. Routing (`react-router-typesafe-routes`, `src/routes.ts`): `AppLayout` shows a spinner while verifying, `AuthWrapper` redirects anonymous users to `/login`, `LoginPage` redirects authenticated users to `/map`, `/` and unknown paths redirect to `/map`.

`MapPage` is loaded with `React.lazy` (Suspense in `AppLayout`); webpack `splitChunks` groups vendors into `vendors-react`, `vendors-mui`, `vendors-leaflet`, `vendors-validation` and `vendors`, so Leaflet loads only with the map.

Map markers bypass React: `MapObjectsLayer` (`view/map/map.objects.layer.ts`) owns one `L.Marker` per object inside a `leaflet.markercluster` group and is fed by a MobX `reaction` on `ObjectsService.items`. Each update moves markers in bulk (`removeLayers` → `setLatLng` → `addLayers`) instead of per-marker moves, rotates icons via `style.transform` on the static icon HTML, uses one shared popup, and buffers updates while the map is moving (`movestart`/`moveend`). The objects list is virtualized with `@tanstack/react-virtual`.

Import alias `~/*` maps to `frontend/src/*`. `API_HOST` (from `.env`, injected by `dotenv-webpack`) is the backend base URL. `src/declarations.d.ts` declares `*.css` modules.
