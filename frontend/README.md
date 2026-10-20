# Object Tracking Application - Frontend

A React-based frontend application for tracking objects on a map with real-time updates.

## Technology Stack

- **React 19** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Leaflet** for interactive maps
- **React Query** for data fetching and caching
- **MobX** for state management
- **React Hook Form** for form handling
- **Webpack** for bundling
- **React Router** for navigation

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js** 22 or higher
- **Yarn** 4 (enable it with `corepack enable`)
- **Backend API** running (see backend README for setup instructions)

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
yarn start
```

The application will start on `http://localhost:3000` (or the next available port).

## Available Scripts

### Development

- `yarn start` - Starts the development server with Fast Refresh
- `yarn build` - Builds the production bundle into `build/`
- `yarn typecheck` - Type-checks the project (the build itself does not report type errors)
- `yarn format` - Formats code using Prettier
- `yarn orval` - Generates the TypeScript API client (requires the running backend)

## Key Features

- **Real-time Object Tracking** - View objects on an interactive map with live updates
- **Authentication** - Secure login system with API key authentication
- **Responsive Design** - Works on desktop and mobile devices
- **Server-Sent Events** - Real-time updates without page refresh
- **Object Management** - View and manage tracked objects

## API Integration

The frontend communicates with the backend API using:

- **Axios** for HTTP requests
- **Server-Sent Events** for real-time updates
- **Generated API client** from OpenAPI specification

## Development Notes

### Hot Reload

The development server supports hot reload, so changes to your code will automatically refresh the browser.

### API Code Generation

This project uses Orval to generate TypeScript API clients from the backend's OpenAPI specification (`${API_HOST}/api-json`). If the backend API changes, start the backend and regenerate the client:

```bash
yarn orval
```

## License

This project is private and unlicensed.