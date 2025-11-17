#!/bin/bash

# Firebase Configuration Script for Flutter Mobile App
# InamiMapApp V4.1

set -e

echo "🔥 Configuring Firebase for Flutter mobile app..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_status "Installing Firebase CLI..."
    npm install -g firebase-tools
else
    print_success "Firebase CLI already installed"
fi

# Check if FlutterFire CLI is installed
if ! command -v flutterfire &> /dev/null; then
    print_status "Installing FlutterFire CLI..."
    dart pub global activate flutterfire_cli
else
    print_success "FlutterFire CLI already installed"
fi

# Login to Firebase (if not already logged in)
print_status "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    print_status "Please login to Firebase..."
    firebase login
fi

# Configure Firebase for Flutter project
print_status "Configuring Firebase for Flutter project..."
print_warning "Make sure you have created a Firebase project and enabled the necessary services:"
print_warning "1. Authentication (Google Sign-In)"
print_warning "2. Firestore Database"
print_warning "3. Storage"

echo
print_status "Available Firebase projects:"
firebase projects:list

echo
read -p "Enter your Firebase project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    print_error "Project ID cannot be empty"
    exit 1
fi

# Configure FlutterFire
print_status "Configuring FlutterFire for project: $PROJECT_ID"
flutterfire configure --project=$PROJECT_ID

# Create Firebase configuration documentation
cat > FIREBASE_SETUP.md << EOF
# Firebase Configuration for InamiMapApp Mobile

## Project Configuration
- Project ID: $PROJECT_ID
- Platform: iOS and Android

## Required Firebase Services

### 1. Authentication
- Enable Google Sign-In provider
- Configure OAuth consent screen
- Add iOS bundle ID and Android package name

### 2. Firestore Database
- Create database in production mode
- Set up security rules for shops and events collections
- Enable offline persistence

### 3. Storage
- Enable Firebase Storage for image uploads
- Configure security rules for authenticated users

## Security Rules

### Firestore Rules (\`firestore.rules\`)
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read approved shops
    match /shops/{shopId} {
      allow read: if resource.data.approvalStatus == 'approved';
    }
    
    // Users can read approved events
    match /events/{eventId} {
      allow read: if resource.data.approvalStatus == 'approved';
    }
    
    // Authenticated users can manage their favorites
    match /favorites/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

### Storage Rules (\`storage.rules\`)
\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for approved shop/event images
    match /{allPaths=**} {
      allow read: if true;
    }
  }
}
\`\`\`

## Platform Configuration

### Android Configuration
1. Download \`google-services.json\` from Firebase console
2. Place in \`android/app/\` directory
3. Update \`android/app/build.gradle\` with package name
4. Ensure minimum SDK version is 21 or higher

### iOS Configuration
1. Download \`GoogleService-Info.plist\` from Firebase console
2. Add to iOS project via Xcode
3. Configure URL schemes in Info.plist
4. Set minimum iOS version to 11.0 or higher

## Testing
1. Run \`flutter doctor\` to verify setup
2. Test authentication flow
3. Verify Firestore data access
4. Test image loading from Storage

## Next Steps
1. Deploy security rules: \`firebase deploy --only firestore:rules,storage\`
2. Test on both iOS and Android devices
3. Configure app signing for production builds
EOF

print_success "Firebase configuration completed!"
print_status "Created FIREBASE_SETUP.md with detailed setup instructions"
print_warning "Don't forget to:"
print_warning "1. Download and place google-services.json (Android)"
print_warning "2. Download and add GoogleService-Info.plist (iOS)"
print_warning "3. Deploy security rules to Firebase"

# Check if configuration files exist
if [ -f "android/app/google-services.json" ]; then
    print_success "Android configuration file found"
else
    print_warning "Missing: android/app/google-services.json"
fi

if [ -f "ios/Runner/GoogleService-Info.plist" ]; then
    print_success "iOS configuration file found"
else
    print_warning "Missing: ios/Runner/GoogleService-Info.plist"
fi