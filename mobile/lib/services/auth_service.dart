import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // 現在のユーザーを取得
  User? get currentUser => _auth.currentUser;

  // ユーザー認証状態の変更を監視
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Google Sign-In
  Future<UserModel?> signInWithGoogle() async {
    try {
      // Google Sign-In フロー開始
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // ユーザーがログインをキャンセル
        return null;
      }

      // Google認証情報を取得
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Firebase認証用のクレデンシャルを作成
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Firebaseにサインイン
      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      final User? user = userCredential.user;

      if (user != null) {
        // Firestoreにユーザー情報を保存/更新
        final userModel = UserModel.fromFirebaseUser(user);
        await _saveUserToFirestore(userModel);
        return userModel;
      }

      return null;
    } catch (e) {
      print('Google Sign-In エラー: $e');
      rethrow;
    }
  }

  // Firestoreにユーザー情報を保存
  Future<void> _saveUserToFirestore(UserModel userModel) async {
    try {
      await _firestore.collection('users').doc(userModel.uid).set({
        'uid': userModel.uid,
        'email': userModel.email,
        'displayName': userModel.displayName,
        'photoURL': userModel.photoURL,
        'lastLogin': FieldValue.serverTimestamp(),
        'role': 'user', // デフォルトでuser権限
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (e) {
      print('Firestoreユーザー保存エラー: $e');
    }
  }

  // Firestoreからユーザー情報を取得
  Future<UserModel?> getUserFromFirestore(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        final data = doc.data()!;
        return UserModel.fromMap(data);
      }
      return null;
    } catch (e) {
      print('Firestoreユーザー取得エラー: $e');
      return null;
    }
  }

  // サインアウト
  Future<void> signOut() async {
    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);
    } catch (e) {
      print('サインアウトエラー: $e');
      rethrow;
    }
  }

  // アカウント削除
  Future<void> deleteAccount() async {
    try {
      final user = _auth.currentUser;
      if (user != null) {
        // Firestoreのユーザーデータを削除
        await _firestore.collection('users').doc(user.uid).delete();
        
        // Firebase Authからユーザーを削除
        await user.delete();
        
        // Google Sign-Inからもサインアウト
        await _googleSignIn.signOut();
      }
    } catch (e) {
      print('アカウント削除エラー: $e');
      rethrow;
    }
  }
}