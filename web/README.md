# InamiMapApp Web Frontend

React TypeScript web application for the InamiMapApp project, built with Vite.

## Features

- Interactive maps using React Leaflet
- Responsive design
- TypeScript for type safety
- React Router for navigation
- Axios for API communication
- Modern development with Vite

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests with Vitest
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

Create a `.env.local` file for local development:

```env
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API calls and external services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── App.tsx        # Main app component
└── main.tsx       # App entry point
```

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- React Router for routing
- Leaflet for interactive maps
- Axios for HTTP requests
- ESLint + Prettier for code quality