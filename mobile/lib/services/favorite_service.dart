import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/favorite_model.dart';
import '../models/shop_model.dart';
import '../models/event_model.dart';

class FavoriteService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // お気に入りを追加
  Future<void> addFavorite({
    required String itemType,
    required String itemId,
  }) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('ユーザーが認証されていません');

    try {
      // 既にお気に入りに追加されているかチェック
      final existingFavorite = await _firestore
          .collection('favorites')
          .where('userId', isEqualTo: user.uid)
          .where('itemType', isEqualTo: itemType)
          .where('itemId', isEqualTo: itemId)
          .limit(1)
          .get();

      if (existingFavorite.docs.isEmpty) {
        // お気に入りに追加
        await _firestore.collection('favorites').add({
          'userId': user.uid,
          'itemType': itemType,
          'itemId': itemId,
          'createdAt': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      print('お気に入り追加エラー: $e');
      rethrow;
    }
  }

  // お気に入りを削除
  Future<void> removeFavorite({
    required String itemType,
    required String itemId,
  }) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('ユーザーが認証されていません');

    try {
      final favoriteQuery = await _firestore
          .collection('favorites')
          .where('userId', isEqualTo: user.uid)
          .where('itemType', isEqualTo: itemType)
          .where('itemId', isEqualTo: itemId)
          .get();

      for (var doc in favoriteQuery.docs) {
        await doc.reference.delete();
      }
    } catch (e) {
      print('お気に入り削除エラー: $e');
      rethrow;
    }
  }

  // お気に入りかどうかをチェック
  Future<bool> isFavorite({
    required String itemType,
    required String itemId,
  }) async {
    final user = _auth.currentUser;
    if (user == null) return false;

    try {
      final favoriteQuery = await _firestore
          .collection('favorites')
          .where('userId', isEqualTo: user.uid)
          .where('itemType', isEqualTo: itemType)
          .where('itemId', isEqualTo: itemId)
          .limit(1)
          .get();

      return favoriteQuery.docs.isNotEmpty;
    } catch (e) {
      print('お気に入りチェックエラー: $e');
      return false;
    }
  }

  // ユーザーのお気に入り一覧を取得
  Stream<List<FavoriteModel>> getFavorites() {
    final user = _auth.currentUser;
    if (user == null) return Stream.value([]);

    return _firestore
        .collection('favorites')
        .where('userId', isEqualTo: user.uid)
        // .orderBy('createdAt', descending: true) // 一時的にコメントアウト
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => FavoriteModel.fromFirestore(doc))
            .toList());
  }

  // お気に入り店舗一覧を取得
  Stream<List<ShopModel>> getFavoriteShops() {
    final user = _auth.currentUser;
    if (user == null) return Stream.value([]);

    return _firestore
        .collection('favorites')
        .where('userId', isEqualTo: user.uid)
        .where('itemType', isEqualTo: 'shop')
        // .orderBy('createdAt', descending: true) // 一時的にコメントアウト
        .snapshots()
        .asyncMap((snapshot) async {
      final shopIds = snapshot.docs
          .map((doc) => doc.data()['itemId'] as String)
          .toList();

      if (shopIds.isEmpty) return <ShopModel>[];

      // 店舗情報を取得（バッチで取得）
      final shops = <ShopModel>[];
      for (final shopId in shopIds) {
        try {
          final shopDoc = await _firestore.collection('shops').doc(shopId).get();
          if (shopDoc.exists) {
            final shop = ShopModel.fromFirestore(shopDoc);
            // 承認済みの店舗のみ表示
            if (shop.isApproved) {
              shops.add(shop);
            }
          }
        } catch (e) {
          print('店舗取得エラー (ID: $shopId): $e');
        }
      }
      return shops;
    });
  }

  // お気に入りイベント一覧を取得
  Stream<List<EventModel>> getFavoriteEvents() {
    final user = _auth.currentUser;
    if (user == null) return Stream.value([]);

    return _firestore
        .collection('favorites')
        .where('userId', isEqualTo: user.uid)
        .where('itemType', isEqualTo: 'event')
        // .orderBy('createdAt', descending: true) // 一時的にコメントウト
        .snapshots()
        .asyncMap((snapshot) async {
      final eventIds = snapshot.docs
          .map((doc) => doc.data()['itemId'] as String)
          .toList();

      if (eventIds.isEmpty) return <EventModel>[];

      // イベント情報を取得（バッチで取得）
      final events = <EventModel>[];
      for (final eventId in eventIds) {
        try {
          final eventDoc = await _firestore.collection('events').doc(eventId).get();
          if (eventDoc.exists) {
            final event = EventModel.fromFirestore(eventDoc);
            // 承認済みのイベントのみ表示
            if (event.isApproved) {
              events.add(event);
            }
          }
        } catch (e) {
          print('イベント取得エラー (ID: $eventId): $e');
        }
      }
      return events;
    });
  }

  // お気に入りの統計情報を取得
  Future<Map<String, int>> getFavoriteStats() async {
    final user = _auth.currentUser;
    if (user == null) return {'shops': 0, 'events': 0, 'total': 0};

    try {
      final favorites = await _firestore
          .collection('favorites')
          .where('userId', isEqualTo: user.uid)
          .get();

      int shopCount = 0;
      int eventCount = 0;

      for (var doc in favorites.docs) {
        final itemType = doc.data()['itemType'] as String;
        if (itemType == 'shop') {
          shopCount++;
        } else if (itemType == 'event') {
          eventCount++;
        }
      }

      return {
        'shops': shopCount,
        'events': eventCount,
        'total': shopCount + eventCount,
      };
    } catch (e) {
      print('お気に入り統計取得エラー: $e');
      return {'shops': 0, 'events': 0, 'total': 0};
    }
  }
}