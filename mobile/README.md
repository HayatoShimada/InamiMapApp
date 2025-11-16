# InamiMapApp Mobile

Flutter cross-platform mobile application for the InamiMapApp project.

## Features

- Interactive maps using Flutter Map
- Location services and GPS navigation
- Offline data support
- Cross-platform (iOS and Android)
- Material Design UI
- Provider state management

## Prerequisites

- Flutter SDK 3.0.0 or higher
- Android Studio / Xcode for platform-specific builds
- Android device/emulator or iOS device/simulator for testing

## Setup

1. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

2. Run on emulator/device:
   ```bash
   flutter run
   ```

## Available Commands

- `flutter pub get` - Get dependencies
- `flutter run` - Run on connected device/emulator
- `flutter build apk` - Build Android APK
- `flutter build ios` - Build iOS app
- `flutter test` - Run tests
- `flutter format .` - Format code
- `flutter analyze` - Analyze code for issues

## Project Structure

```
lib/
├── models/        # Data models
├── screens/       # App screens/pages
├── providers/     # State management (Provider pattern)
├── services/      # External services (API, etc.)
├── widgets/       # Reusable UI components
├── utils/         # Utility functions
└── main.dart      # App entry point
```

## Dependencies

### Core
- `flutter_map` - Interactive maps
- `provider` - State management
- `dio` - HTTP client
- `geolocator` - Location services

### UI
- `cupertino_icons` - iOS-style icons

### Storage
- `shared_preferences` - Simple key-value storage
- `sqflite` - SQLite database

## Configuration

### Android
- Add location permissions in `android/app/src/main/AndroidManifest.xml`
- Configure minimum SDK version in `android/app/build.gradle`

### iOS
- Add location permissions in `ios/Runner/Info.plist`
- Configure deployment target in `ios/Runner.xcodeproj`

## State Management

This app uses the Provider pattern for state management:
- `LocationProvider` - Handles GPS location and permissions
- `MapDataProvider` - Manages map data and API calls

## API Integration

The app connects to the backend API at `http://localhost:3001/api` by default. It includes:
- Automatic fallback to mock data if API is unavailable
- Error handling and retry logic
- Connection timeout management