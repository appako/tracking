# Object Tracking Application - Backend

A NestJS-based backend API for tracking objects on a map with real-time updates using Server-Sent Events.

## Technology Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Swagger/OpenAPI** - API documentation
- **Class Validator** - Validation decorators
- **RxJS** - Reactive programming

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js** (version 22 or higher)
- **yarn** package manager

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 3. Start the Development Server

```bash
yarn start:dev
```

The API will be available at `http://127.0.0.1:8000/api` with Swagger documentation at `http://127.0.0.1:8000/api` and the OpenAPI JSON at `http://127.0.0.1:8000/api-json`.

## Available Scripts

### Development

- `yarn start:dev` - Starts the development server with hot reload
- `yarn start:debug` - Starts the server in debug mode
- `yarn build` - Builds the project into `dist/`
- `yarn start:prod` - Runs the built project

### Code Quality

- `yarn lint` - Runs ESLint and fixes issues
- `yarn format` - Formats code using Prettier
- `yarn test` - Runs unit tests with Jest

## API Documentation

Swagger documentation is automatically generated and available at:

- **Development**: `http://127.0.0.1:8000/api`
- **Production**: `{HOST}:{PORT}/api`

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests

## Configuration

### Environment Variables

Variables are declared and validated in `EnvService` (`src/common/env.service.ts`); the app refuses to start with an invalid value. Anything not set falls back to its default.

- `HOST` - Server host used in startup logs (default: http://127.0.0.1)
- `PORT` - Server port (default: 8000)
- `VALID_API_KEYS` - Comma-separated list of valid API keys (required)
- `CORS_ORIGIN` - Comma-separated list of origins allowed by CORS (default: http://localhost:3000)
- `MAP_KML_PATH` - Path to the KML file with the polygon objects are generated in, relative to the working directory (default: map.kml)
- `OBJECTS_COUNT` - Number of simulated objects, 1-20000 (default: 150)
- `MOVE_INTERVAL_MS` - Interval between position updates in ms, 100-60000; 100 means 10 Hz (default: 5000)

## License

This project is private and unlicensed.