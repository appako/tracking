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

The API will be available at `http://127.0.0.1:8000/api` with Swagger documentation at `http://127.0.0.1:8000/api`.

## Available Scripts

### Development

- `yarn start:dev` - Starts the development server with hot reload
- `yarn start:debug` - Starts the server in debug mode

### Code Quality

- `yarn lint` - Runs ESLint and fixes issues
- `yarn format` - Formats code using Prettier

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

- `HOST` - Server host (default: http://127.0.0.1)
- `PORT` - Server port (default: 8000)
- `VALID_API_KEYS` - Comma-separated list of valid API keys

## License

This project is private and unlicensed.