# 🚀 Development Environment Setup - InamiMapApp V4.1

Complete setup guide for Android and iOS development environments for the InamiMapApp Flutter mobile application.

## 📋 Prerequisites

- **macOS**: Required for iOS development
- **Administrator access**: For installing development tools
- **Active internet connection**: For downloading SDKs and dependencies
- **Apple Developer account**: Required for iOS App Store distribution (optional for development)

## 🛠 Quick Setup

Run the automated setup script:

```bash
cd mobile
./setup_dev_env.sh
```

After running the script, continue with the manual steps below.

## 📱 Platform-Specific Setup

### Android Development

#### 1. Install Android Studio
```bash
brew install --cask android-studio
```

#### 2. Configure Android Studio
1. Launch Android Studio
2. Complete the setup wizard
3. Install Android SDK (API level 34 recommended)
4. Create an Android Virtual Device (AVD)

#### 3. Accept Android Licenses
```bash
flutter doctor --android-licenses
```

#### 4. Configure Environment Variables
Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### 5. Android Project Configuration
The following files have been pre-configured:

**`android/app/build.gradle`**:
- Application ID: `com.inamimapapp.inami_map_app`
- Min SDK: 21 (Android 5.0+)
- Target SDK: 34 (Android 14)
- Version: 4.1.0 (Build 2)
- Firebase integration enabled

**`android/build.gradle`**:
- Google Services plugin configured
- Firebase BOM for dependency management

### iOS Development

#### 1. Install Xcode
Download and install from the Mac App Store (required - cannot be automated).

#### 2. Install Command Line Tools
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcode-select --install
```

#### 3. Install CocoaPods
```bash
sudo gem install cocoapods
cd ios && pod setup
```

#### 4. iOS Project Configuration
**`ios/Runner/Info.plist`** is configured with:
- Bundle identifier: `com.inamimapapp.inami_map_app`
- Display name: 井波マップアプリ
- Location permission description
- URL schemes for Google Sign-In

## 🔥 Firebase Configuration

### 1. Install Firebase CLI Tools
```bash
npm install -g firebase-tools
dart pub global activate flutterfire_cli
```

### 2. Configure Firebase Project
```bash
./configure_firebase.sh
```

### 3. Download Configuration Files

#### For Android:
1. Go to Firebase Console → Project Settings → Your Apps
2. Download `google-services.json`
3. Place in `android/app/google-services.json`

#### For iOS:
1. Go to Firebase Console → Project Settings → Your Apps
2. Download `GoogleService-Info.plist`
3. Add to Xcode project in `ios/Runner/`

### 4. Enable Required Services
In Firebase Console, enable:
- **Authentication** (Google Sign-In provider)
- **Firestore Database**
- **Cloud Storage**

## 🧪 Development Tools

### Flutter Doctor
Verify your setup:
```bash
flutter doctor -v
```

Expected output should show ✅ for:
- Flutter SDK
- Android toolchain
- Xcode (iOS development)
- Android Studio
- Connected devices

### Useful Commands
```bash
# Run on connected device
flutter run

# Run on specific device
flutter run -d <device-id>

# Build for testing
flutter build apk --debug          # Android
flutter build ios --debug          # iOS

# Install dependencies
flutter pub get

# Clean build cache
flutter clean
```

## 📱 Device Setup

### Android Device
1. Enable Developer Options
2. Enable USB Debugging
3. Install via ADB: `flutter install`

### iOS Device
1. Enable Developer Mode in Settings
2. Trust developer certificate
3. Build and run via Xcode or Flutter CLI

### Simulators/Emulators

#### Android Emulator
```bash
# List available devices
flutter emulators

# Launch emulator
flutter emulators --launch <emulator_name>

# Run app
flutter run
```

#### iOS Simulator
```bash
# Open iOS simulator
open -a Simulator

# List iOS devices
flutter devices

# Run on iOS simulator
flutter run -d ios
```

## 🏗 Build Configuration

### Debug Builds
- Automatically signed with debug certificates
- All features enabled
- Performance debugging tools available

### Release Builds

#### Android
```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

#### iOS
```bash
# Build for testing
flutter build ios --release

# Archive for App Store (via Xcode)
# Open ios/Runner.xcworkspace in Xcode
# Product → Archive → Distribute App
```

## 🔧 Troubleshooting

### Common Issues

#### "Unable to find bundled Java version"
```bash
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jre/Contents/Home
```

#### "Pod install failed"
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --clean-install
```

#### "DerivedData build errors"
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
flutter clean
flutter pub get
```

#### "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

### Performance Optimization

#### Android
- Enable R8 shrinking in release builds
- Use App Bundle for smaller download size
- Test on various Android versions

#### iOS
- Optimize image assets for different screen densities
- Test on various iOS versions and devices
- Use Instruments for performance profiling

## 📚 Additional Resources

### Documentation
- [Flutter Installation Guide](https://flutter.dev/docs/get-started/install)
- [Firebase for Flutter](https://firebase.flutter.dev/)
- [Android Studio Setup](https://developer.android.com/studio)
- [Xcode Setup](https://developer.apple.com/xcode/)

### Project-Specific
- `FIREBASE_SETUP.md`: Detailed Firebase configuration
- `pubspec.yaml`: Dependencies and project configuration
- `README.md`: Project overview and features

## 🎯 Next Steps

1. ✅ Run setup scripts
2. ✅ Install Xcode from App Store
3. ✅ Configure Firebase project
4. ✅ Download configuration files
5. ✅ Test builds on both platforms
6. ✅ Set up code signing for distribution

## 📝 Development Workflow

### Daily Development
1. `flutter pub get` - Update dependencies
2. `flutter run` - Launch debug build
3. Hot reload with `r` for quick iterations
4. `flutter doctor` - Verify environment health

### Before Deployment
1. `flutter test` - Run tests
2. `flutter analyze` - Static code analysis  
3. `flutter build` - Create release builds
4. Test on real devices
5. Submit to app stores

---

**Development Team**: Claude Code + 85-Store  
**Last Updated**: 2025/11/17  
**Version**: 4.1.0