# InamiMapApp Backend

Express.js API server for the InamiMapApp project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration

4. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- `POST /api/auth/*` - Authentication endpoints (coming soon)
- `GET /api/maps/*` - Map data endpoints (coming soon)  
- `GET /api/locations/*` - Location endpoints (coming soon)

## Environment Variables

See `.env.example` for all available configuration options.


