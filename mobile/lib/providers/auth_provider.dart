import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _currentUser != null;

  AuthProvider() {
    // 認証状態の変更を監視
    _authService.authStateChanges.listen((User? firebaseUser) async {
      if (firebaseUser != null) {
        // ログイン済み
        final userModel = await _authService.getUserFromFirestore(firebaseUser.uid);
        _currentUser = userModel ?? UserModel.fromFirebaseUser(firebaseUser);
      } else {
        // ログアウト
        _currentUser = null;
      }
      notifyListeners();
    });
  }

  // Google Sign-In
  Future<bool> signInWithGoogle() async {
    try {
      _setLoading(true);
      _clearError();

      final userModel = await _authService.signInWithGoogle();
      if (userModel != null) {
        _currentUser = userModel;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _setError('ログインに失敗しました: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // サインアウト
  Future<void> signOut() async {
    try {
      _setLoading(true);
      _clearError();

      await _authService.signOut();
      _currentUser = null;
      notifyListeners();
    } catch (e) {
      _setError('ログアウトに失敗しました: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  // アカウント削除
  Future<bool> deleteAccount() async {
    try {
      _setLoading(true);
      _clearError();

      await _authService.deleteAccount();
      _currentUser = null;
      notifyListeners();
      return true;
    } catch (e) {
      _setError('アカウント削除に失敗しました: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ユーザー情報を更新
  Future<void> refreshUser() async {
    if (_currentUser != null) {
      try {
        final updatedUser = await _authService.getUserFromFirestore(_currentUser!.uid);
        if (updatedUser != null) {
          _currentUser = updatedUser;
          notifyListeners();
        }
      } catch (e) {
        print('ユーザー情報更新エラー: $e');
      }
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }
}