# 井波町マップアプリ

富山県南砺市井波の店舗・イベント情報を管理するためのWebアプリケーションです。

## Project Structure

This is a monorepo containing:

- **backend/**: API server for map data and business logic
- **web/**: Web frontend application
- **mobile/**: Flutter cross-platform mobile app
- **shared/**: Shared resources and utilities
- **docs/**: Project documentation

## Quick Start

### Prerequisites

- Node.js (for backend and web frontend)
- Flutter SDK (for mobile app)
- Database (PostgreSQL recommended for geospatial features)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd InamiMapApp
   ```

2. Install dependencies for each component:
   ```bash
   # Backend
   cd backend && npm install

   # Web frontend
   cd ../web && npm install

   # Flutter mobile
   cd ../mobile && flutter pub get
   ```

3. Set up environment variables and database configuration

4. Start development servers:
   ```bash
   # Backend (in backend/ directory)
   npm run dev

   # Web frontend (in web/ directory)
   npm run dev

   # Flutter mobile (in mobile/ directory)
   flutter run
   ```

## Documentation

- [Design Documentation](DESIGN.md)
- [Development Guide](CLAUDE.md)
- [API Documentation](docs/api.md) *(coming soon)*

## Contributing

See [CLAUDE.md](CLAUDE.md) for development workflow and architecture details.