import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'providers/auth_provider.dart';
import 'providers/favorite_provider.dart';
import 'providers/navigation_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';

/// 開発環境でエミュレータを使用するかどうか
/// ローカル開発時はtrueに設定
const bool useEmulator = bool.fromEnvironment('USE_EMULATOR', defaultValue: true);

/// エミュレータのホスト（Androidエミュレータからは10.0.2.2、iOSシミュレータからはlocalhost）
const String emulatorHost = String.fromEnvironment('EMULATOR_HOST', defaultValue: '10.0.2.2');

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase初期化（重複チェック）
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    // Firebase already initialized
    print('Firebase already initialized: $e');
  }

  // 開発環境でエミュレータに接続
  if (useEmulator) {
    await _connectToEmulators();
  }

  runApp(const InamiMapApp());
}

/// Firebase Emulatorsに接続
Future<void> _connectToEmulators() async {
  try {
    // Authエミュレータ
    await FirebaseAuth.instance.useAuthEmulator(emulatorHost, 9099);

    // Firestoreエミュレータ
    FirebaseFirestore.instance.useFirestoreEmulator(emulatorHost, 8080);

    // Storageエミュレータ
    await FirebaseStorage.instance.useStorageEmulator(emulatorHost, 9199);

    print('Connected to Firebase Emulators at $emulatorHost');
  } catch (e) {
    print('Error connecting to emulators: $e');
  }
}

class InamiMapApp extends StatelessWidget {
  const InamiMapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(create: (_) => NavigationProvider()),
      ],
      child: MaterialApp(
        title: 'とことこ井波マップ',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            elevation: 0,
            centerTitle: true,
          ),
        ),
        home: const SplashScreen(),
        routes: {
          '/home': (context) => const HomeScreen(),
        },
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

