import 'package:cloud_firestore/cloud_firestore.dart';

class FavoriteModel {
  final String id;
  final String userId;
  final String itemType; // 'shop' or 'event'
  final String itemId;
  final DateTime createdAt;

  FavoriteModel({
    required this.id,
    required this.userId,
    required this.itemType,
    required this.itemId,
    required this.createdAt,
  });

  factory FavoriteModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return FavoriteModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      itemType: data['itemType'] ?? '',
      itemId: data['itemId'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'itemType': itemType,
      'itemId': itemId,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  bool get isShop => itemType == 'shop';
  bool get isEvent => itemType == 'event';
}