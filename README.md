# Object Tracking Application

A full-stack web application for tracking objects on an interactive map with real-time updates. The application consists of a React frontend and a NestJS backend API.

## Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **yarn** package manager

### 1. Clone and Setup

```bash
git clone <repository-url>
cd tracking
```

## Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Swagger** - API documentation

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Leaflet** - Interactive maps

## Key Features

- 🗺️ **Interactive Map** - View objects on a real-time map
- 🔄 **Real-time Updates** - Live object tracking with SSE and WebSockets
- 🔐 **Authentication** - Secure API key-based authentication
- 📱 **Responsive Design** - Works on desktop and mobile
- 📊 **Object Management** - Create, update, and delete tracked objects
- 📚 **API Documentation** - Auto-generated Swagger docs

### API Integration

The frontend automatically generates TypeScript API clients from the backend's OpenAPI specification. When you modify backend endpoints, the frontend types are automatically updated.

## License

This project is private and unlicensed.