import 'package:flutter/material.dart';
import '../models/favorite_model.dart';
import '../models/shop_model.dart';
import '../models/event_model.dart';
import '../services/favorite_service.dart';

class FavoriteProvider with ChangeNotifier {
  final FavoriteService _favoriteService = FavoriteService();

  List<FavoriteModel> _favorites = [];
  List<ShopModel> _favoriteShops = [];
  List<EventModel> _favoriteEvents = [];
  Map<String, int> _stats = {'shops': 0, 'events': 0, 'total': 0};
  bool _isLoading = false;
  String? _errorMessage;

  List<FavoriteModel> get favorites => _favorites;
  List<ShopModel> get favoriteShops => _favoriteShops;
  List<EventModel> get favoriteEvents => _favoriteEvents;
  Map<String, int> get stats => _stats;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  FavoriteProvider() {
    _initializeFavorites();
  }

  void _initializeFavorites() {
    // お気に入り一覧の監視
    _favoriteService.getFavorites().listen((favorites) {
      _favorites = favorites;
      notifyListeners();
    });

    // お気に入り店舗一覧の監視
    _favoriteService.getFavoriteShops().listen((shops) {
      _favoriteShops = shops;
      notifyListeners();
    });

    // お気に入りイベント一覧の監視
    _favoriteService.getFavoriteEvents().listen((events) {
      _favoriteEvents = events;
      notifyListeners();
    });

    // 統計情報を取得
    _loadStats();
  }

  // お気に入りを追加
  Future<bool> addFavorite({
    required String itemType,
    required String itemId,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      await _favoriteService.addFavorite(
        itemType: itemType,
        itemId: itemId,
      );

      // 統計情報を更新
      await _loadStats();
      return true;
    } catch (e) {
      _setError('お気に入りの追加に失敗しました: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // お気に入りを削除
  Future<bool> removeFavorite({
    required String itemType,
    required String itemId,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      await _favoriteService.removeFavorite(
        itemType: itemType,
        itemId: itemId,
      );

      // 統計情報を更新
      await _loadStats();
      return true;
    } catch (e) {
      _setError('お気に入りの削除に失敗しました: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // お気に入りかどうかをチェック
  Future<bool> isFavorite({
    required String itemType,
    required String itemId,
  }) async {
    try {
      return await _favoriteService.isFavorite(
        itemType: itemType,
        itemId: itemId,
      );
    } catch (e) {
      print('お気に入りチェックエラー: $e');
      return false;
    }
  }

  // 店舗のお気に入り切り替え
  Future<bool> toggleShopFavorite(String shopId) async {
    final isFav = await isFavorite(itemType: 'shop', itemId: shopId);
    
    if (isFav) {
      return await removeFavorite(itemType: 'shop', itemId: shopId);
    } else {
      return await addFavorite(itemType: 'shop', itemId: shopId);
    }
  }

  // イベントのお気に入り切り替え
  Future<bool> toggleEventFavorite(String eventId) async {
    final isFav = await isFavorite(itemType: 'event', itemId: eventId);
    
    if (isFav) {
      return await removeFavorite(itemType: 'event', itemId: eventId);
    } else {
      return await addFavorite(itemType: 'event', itemId: eventId);
    }
  }

  // 統計情報を読み込み
  Future<void> _loadStats() async {
    try {
      final stats = await _favoriteService.getFavoriteStats();
      _stats = stats;
      notifyListeners();
    } catch (e) {
      print('統計情報取得エラー: $e');
    }
  }

  // お気に入りデータをリフレッシュ
  Future<void> refresh() async {
    await _loadStats();
    notifyListeners();
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