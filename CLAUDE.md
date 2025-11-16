# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InamiMapApp is a Firebase-based mapping platform for Inami town (南砺市井波) featuring shop discovery and event management. The application has two main components: a Flutter mobile app for users to discover shops and events, and a web admin panel for shop owners to manage their information and submit events for approval.

## Project Structure

```
InamiMapApp/
├── web/              # Shop owner admin panel (React/Vite/TypeScript)
│   ├── src/          # React components and pages
│   ├── public/       # Static assets
│   ├── package.json  
│   └── README.md
├── mobile/           # User-facing Flutter app 
│   ├── lib/          # Dart source code
│   ├── android/      # Android platform files
│   ├── ios/          # iOS platform files
│   ├── pubspec.yaml  # Flutter dependencies
│   └── README.md
├── backend/          # Legacy Node.js backend (migrating to Firebase)
├── shared/           # Shared TypeScript types and utilities
├── firebase/         # Firebase configuration and rules
├── DESIGN.md         # Detailed development plan and specifications
├── TODO.md           # Phase-by-phase development tasks
├── TABLE.md          # Database schema and data models
└── .claude/          # Claude Code configuration

## Development Commands

### Firebase Setup and Management
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Start Firebase emulators for local development
firebase emulators:start

# Deploy to Firebase hosting
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules  
firebase deploy --only storage
```

### Web Admin Panel (React/Vite)
```bash
cd web
# Install dependencies
npm install

# Start development with Firebase emulators
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Flutter Mobile App
```bash
cd mobile
# Get dependencies
flutter pub get

# Run on emulator/device (with Firebase emulators)
flutter run

# Build for Android
flutter build apk

# Build for iOS  
flutter build ios

# Run tests
flutter test

# Analyze code
flutter analyze

# Format code
flutter format .
```

## Architecture Notes

This is a Firebase-based application with two main frontends:

### Backend (Firebase BaaS)
- **Database**: Cloud Firestore with geospatial support (GeoPoint)
- **Authentication**: Firebase Auth with Google Sign-in only
- **Storage**: Cloud Storage for Firebase (shop/event images, max 5 per item)
- **Functions**: Cloud Functions for TypeScript for image processing and approval workflows
- **Hosting**: Firebase Hosting for web admin panel
- **Security**: Firestore and Storage security rules for role-based access

### Web Admin Panel (React/Vite/TypeScript)
- **Purpose**: Shop owner management interface (web-only access)
- **Technology Stack**: React 18 with TypeScript and Vite
- **Authentication**: Google Sign-in with Firebase Auth
- **Key Features**:
  - Shop information management (name, category, location, images)
  - Event submission (requires admin approval before publishing)
  - Image upload (5 images max per shop/event)
- **Data Models**: Users, Shops, Events, Maps (see TABLE.md)

### Mobile App (Flutter)
- **Purpose**: User-facing app for discovering shops and events  
- **Technology Stack**: Flutter 3+ with Dart
- **Authentication**: No authentication required for users
- **Key Features**:
  - Map view with shop/event locations (Google Maps integration)
  - Shop and event discovery and details
  - Favorites and visit history
  - Route guidance to locations
- **Offline**: Local data caching with fallback data

### Data Architecture (Firestore Collections)
Based on TABLE.md specifications:
- **users**: Shop owner profiles (Google Auth data)
- **shops**: Shop information with owner references and categories
- **events**: Event submissions with approval status and multi-shop support
- **maps**: General location data (public facilities, parking, etc.)
- **categories**: Admin-managed shop and event categories

## Key Development Workflows

### Event Approval System
1. Shop owners submit events via web admin panel
2. Events are stored with `approval_status: 'pending'`
3. Admin users (with `role: 'admin'`) review and approve/reject events
4. Approved events become visible in mobile app
5. Cloud Functions handle automated processing (image resize, notifications)

### Image Management  
- Maximum 5 images per shop or event (enforced client-side and server-side)
- Images stored in Cloud Storage with organized paths: `/shops/{shopId}/` and `/events/{eventId}/`
- Cloud Functions automatically resize images for mobile optimization
- Security rules prevent unauthorized uploads

### Authentication Flow
- **Web Admin**: Google Sign-in required, user data auto-saved to Firestore on first login
- **Mobile App**: No authentication required for viewing content
- **Admin Privileges**: Manually assigned `role: 'admin'` in Firestore for event approval and category management

## Development Phases (from TODO.md)

### Phase 0: Environment Setup (1-2 days)
1. **Firebase Project Creation**: Set up new Firebase project with Firestore, Auth, Storage, Functions
2. **Development Environment**: Configure VS Code with Cloud Code and Firebase extensions
3. **Firebase Emulators**: Set up local development with emulators for all Firebase services
4. **Data Model Design**: Finalize Firestore schema based on TABLE.md specifications

### Phase 1: Firebase Backend (1-2 days)  
1. **Authentication Setup**: Enable Google Sign-in provider
2. **Database Initialization**: Create Firestore collections and initial security rules
3. **Storage Configuration**: Set up Cloud Storage with proper folder structure

### Phase 2: Web Admin Panel (5-7 days)
1. **React Project Setup**: Initialize with Vite, TypeScript, Firebase SDK
2. **Google Authentication**: Implement sign-in flow with automatic user creation
3. **Shop Management**: Shop registration and editing forms with image upload
4. **Event Management**: Event submission forms with image upload and approval workflow

### Phase 3: Mobile App (7-10 days)
1. **Flutter Project Setup**: Initialize with Firebase configuration for iOS/Android
2. **Google Maps Integration**: Set up maps with shop/event markers
3. **Content Display**: Implement shop details, event listings, and filtering
4. **User Features**: Favorites, history tracking, route guidance

### Phase 4: Cloud Functions (2-3 days)
1. **Image Processing**: Automatic resize and optimization on upload
2. **Approval Workflow**: Server-side validation and notification system
3. **Data Consistency**: Automated cleanup and validation functions

## Quick Start

1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Setup Firebase**: `firebase login && firebase init`
3. **Start Emulators**: `firebase emulators:start`
4. **Run Web Admin**: `cd web && npm run dev`
5. **Run Mobile App**: `cd mobile && flutter run`

## Important Notes

- **Target Location**: Inami town (南砺市井波), Toyama Prefecture, Japan
- **Primary Users**: Local shop owners (web admin) and visitors/tourists (mobile app)
- **Image Limits**: Maximum 5 images per shop or event (strictly enforced)
- **Admin Approval**: All events must be approved by admin users before public visibility
- **Google Dependencies**: Requires Google Sign-in for shop owners and Google Maps API for mobile
- **Local Development**: Use Firebase emulators to avoid production costs during development
- **Security**: Firestore rules ensure shop owners can only edit their own content