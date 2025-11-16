# Shared Resources

This directory contains shared resources used across all components of the InamiMapApp project.

## Contents

- **types.ts** - TypeScript type definitions shared between backend and frontend
- **constants.ts** - Application constants and configuration values
- **utils.ts** - Utility functions for common operations

## Usage

### Backend (Node.js)
```javascript
// Import types and utilities
const { MapPoint, API_CONFIG } = require('../shared/types');
const { validateEmail } = require('../shared/utils');
```

### Web Frontend (React)
```typescript
// Import types and utilities
import { MapPoint, ApiResponse } from '../shared/types';
import { INAMI_CENTER, MAP_CONFIG } from '../shared/constants';
import { calculateDistance, formatDistance } from '../shared/utils';
```

### Mobile (Flutter)
For Flutter, these TypeScript definitions serve as a reference for creating equivalent Dart classes:

```dart
// Equivalent Dart class for MapPoint
class MapPoint {
  final String id;
  final String name;
  final String description;
  final double latitude;
  final double longitude;
  final String? category;
  final String? imageUrl;
  
  MapPoint({
    required this.id,
    required this.name,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.category,
    this.imageUrl,
  });
}
```

## Benefits

1. **Type Safety** - Consistent data structures across all platforms
2. **DRY Principle** - Single source of truth for constants and utilities
3. **Maintainability** - Changes in one place propagate to all components
4. **Documentation** - Clear interfaces and contracts between services

## Guidelines

- Keep types and interfaces platform-agnostic
- Add comprehensive JSDoc comments for all exports
- Use semantic versioning for breaking changes
- Test utility functions thoroughly
- Avoid platform-specific dependencies