# Tracking Application

A full-stack web application for tracking objects on an interactive map with real-time updates. The application consists of a React frontend and a NestJS backend API.

## Features

- 📍 Interactive map using Leaflet
- 🔄 Real-time updates using WebSocket
- ✨ Create, read, update, and delete tracking objects
- 🗺️ Click on map to add new objects
- 📱 Responsive design
- 💾 SQLite database for persistence

## Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM (ORM)
- SQLite (Database)
- Socket.IO (WebSocket)
- TypeScript

### Frontend
- React
- TypeScript
- Leaflet & React-Leaflet (Map)
- Socket.IO Client (WebSocket)

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

   The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. Make sure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:3000`
3. Click anywhere on the map to add a new tracking object
4. Fill in the form with object details and click "Create"
5. Click on markers to view object details
6. Use the sidebar to edit or delete objects
7. Real-time updates will be reflected across all connected clients

## API Endpoints

### REST API

- `GET /tracking-objects` - Get all tracking objects
- `POST /tracking-objects` - Create a new tracking object
- `GET /tracking-objects/:id` - Get a specific tracking object
- `PATCH /tracking-objects/:id` - Update a tracking object
- `DELETE /tracking-objects/:id` - Delete a tracking object

### WebSocket Events

- `objectCreated` - Emitted when a new object is created
- `objectUpdated` - Emitted when an object is updated
- `objectDeleted` - Emitted when an object is deleted

## Development

### Running Tests

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
npm run build
```

Frontend:
```bash
cd frontend
npm run build
```

## Project Structure

```
tracking/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── tracking-object/
│   │   │   ├── dto/     # Data Transfer Objects
│   │   │   ├── tracking-object.entity.ts
│   │   │   ├── tracking-object.service.ts
│   │   │   ├── tracking-object.controller.ts
│   │   │   ├── tracking-object.gateway.ts
│   │   │   └── tracking-object.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API and WebSocket services
│   │   ├── types/       # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── README.md
```

## License

MIT
