// File generated for development with Firebase Emulators
// This file provides demo Firebase options for local development
// without requiring actual Firebase project credentials.
//
// For production, generate this file using:
//   flutterfire configure

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// This is a demo configuration for local development with Firebase Emulators.
/// For production deployment, regenerate this file with actual credentials.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  // Demo configuration for Firebase Emulators
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'demo-api-key',
    appId: '1:123456789012:web:demo',
    messagingSenderId: '123456789012',
    projectId: 'demo-inami-map-app',
    authDomain: 'demo-inami-map-app.firebaseapp.com',
    storageBucket: 'demo-inami-map-app.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'demo-api-key',
    appId: '1:123456789012:android:demo',
    messagingSenderId: '123456789012',
    projectId: 'demo-inami-map-app',
    storageBucket: 'demo-inami-map-app.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'demo-api-key',
    appId: '1:123456789012:ios:demo',
    messagingSenderId: '123456789012',
    projectId: 'demo-inami-map-app',
    storageBucket: 'demo-inami-map-app.appspot.com',
    iosBundleId: 'com.example.inamiMapApp',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'demo-api-key',
    appId: '1:123456789012:macos:demo',
    messagingSenderId: '123456789012',
    projectId: 'demo-inami-map-app',
    storageBucket: 'demo-inami-map-app.appspot.com',
    iosBundleId: 'com.example.inamiMapApp',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'demo-api-key',
    appId: '1:123456789012:windows:demo',
    messagingSenderId: '123456789012',
    projectId: 'demo-inami-map-app',
    storageBucket: 'demo-inami-map-app.appspot.com',
  );
}
