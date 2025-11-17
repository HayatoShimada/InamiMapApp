import 'package:cloud_firestore/cloud_firestore.dart';

class ShopModel {
  final String id;
  final String shopName;
  final String description;
  final String shopCategory;
  final String address;
  final GeoPoint? location;
  final String? googleMapUrl;
  final String? website;
  final String? onlineStore;
  final Map<String, String>? socialMedia;
  final List<String> images;
  final String ownerUserId;
  final String approvalStatus;
  final DateTime? approvedAt;
  final DateTime? rejectedAt;
  final String? rejectionReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  ShopModel({
    required this.id,
    required this.shopName,
    required this.description,
    required this.shopCategory,
    required this.address,
    this.location,
    this.googleMapUrl,
    this.website,
    this.onlineStore,
    this.socialMedia,
    required this.images,
    required this.ownerUserId,
    this.approvalStatus = 'pending',
    this.approvedAt,
    this.rejectedAt,
    this.rejectionReason,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ShopModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ShopModel(
      id: doc.id,
      shopName: data['shopName'] ?? '',
      description: data['description'] ?? '',
      shopCategory: data['shopCategory'] ?? '',
      address: data['address'] ?? '',
      location: data['location'] as GeoPoint?,
      googleMapUrl: data['googleMapUrl'],
      website: data['website'],
      onlineStore: data['onlineStore'],
      socialMedia: data['socialMedia'] != null 
          ? Map<String, String>.from(data['socialMedia']) 
          : null,
      images: data['images'] != null 
          ? List<String>.from(data['images']) 
          : [],
      ownerUserId: data['ownerUserId'] ?? '',
      approvalStatus: data['approvalStatus'] ?? 'pending',
      approvedAt: data['approvedAt'] != null 
          ? (data['approvedAt'] as Timestamp).toDate() 
          : null,
      rejectedAt: data['rejectedAt'] != null 
          ? (data['rejectedAt'] as Timestamp).toDate() 
          : null,
      rejectionReason: data['rejectionReason'],
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'shopName': shopName,
      'description': description,
      'shopCategory': shopCategory,
      'address': address,
      'location': location,
      'googleMapUrl': googleMapUrl,
      'website': website,
      'onlineStore': onlineStore,
      'socialMedia': socialMedia,
      'images': images,
      'ownerUserId': ownerUserId,
      'approvalStatus': approvalStatus,
      'approvedAt': approvedAt != null ? Timestamp.fromDate(approvedAt!) : null,
      'rejectedAt': rejectedAt != null ? Timestamp.fromDate(rejectedAt!) : null,
      'rejectionReason': rejectionReason,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  // ヘルパーメソッド: 承認済みかどうかをチェック
  bool get isApproved => approvalStatus == 'approved';
}