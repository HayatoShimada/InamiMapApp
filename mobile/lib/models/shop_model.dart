import 'package:cloud_firestore/cloud_firestore.dart';

class BusinessHours {
  final String? open;
  final String? close;
  final bool closed;

  BusinessHours({this.open, this.close, this.closed = false});

  factory BusinessHours.fromMap(Map<String, dynamic> map) {
    return BusinessHours(
      open: map['open'],
      close: map['close'], 
      closed: map['closed'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'open': open,
      'close': close,
      'closed': closed,
    };
  }
}

class WeeklyBusinessHours {
  final BusinessHours? monday;
  final BusinessHours? tuesday;
  final BusinessHours? wednesday;
  final BusinessHours? thursday;
  final BusinessHours? friday;
  final BusinessHours? saturday;
  final BusinessHours? sunday;

  WeeklyBusinessHours({
    this.monday,
    this.tuesday,
    this.wednesday,
    this.thursday,
    this.friday,
    this.saturday,
    this.sunday,
  });

  factory WeeklyBusinessHours.fromMap(Map<String, dynamic> map) {
    return WeeklyBusinessHours(
      monday: map['monday'] != null ? BusinessHours.fromMap(map['monday']) : null,
      tuesday: map['tuesday'] != null ? BusinessHours.fromMap(map['tuesday']) : null,
      wednesday: map['wednesday'] != null ? BusinessHours.fromMap(map['wednesday']) : null,
      thursday: map['thursday'] != null ? BusinessHours.fromMap(map['thursday']) : null,
      friday: map['friday'] != null ? BusinessHours.fromMap(map['friday']) : null,
      saturday: map['saturday'] != null ? BusinessHours.fromMap(map['saturday']) : null,
      sunday: map['sunday'] != null ? BusinessHours.fromMap(map['sunday']) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'monday': monday?.toMap(),
      'tuesday': tuesday?.toMap(),
      'wednesday': wednesday?.toMap(),
      'thursday': thursday?.toMap(),
      'friday': friday?.toMap(),
      'saturday': saturday?.toMap(),
      'sunday': sunday?.toMap(),
    };
  }
}

class TemporaryStatus {
  final bool isTemporaryClosed;
  final bool isReducedHours;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? message;
  final WeeklyBusinessHours? temporaryHours;

  TemporaryStatus({
    required this.isTemporaryClosed,
    required this.isReducedHours,
    this.startDate,
    this.endDate,
    this.message,
    this.temporaryHours,
  });

  factory TemporaryStatus.fromMap(Map<String, dynamic> map) {
    return TemporaryStatus(
      isTemporaryClosed: map['isTemporaryClosed'] ?? false,
      isReducedHours: map['isReducedHours'] ?? false,
      startDate: map['startDate'] != null ? (map['startDate'] as Timestamp).toDate() : null,
      endDate: map['endDate'] != null ? (map['endDate'] as Timestamp).toDate() : null,
      message: map['message'],
      temporaryHours: map['temporaryHours'] != null ? WeeklyBusinessHours.fromMap(map['temporaryHours']) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'isTemporaryClosed': isTemporaryClosed,
      'isReducedHours': isReducedHours,
      'startDate': startDate != null ? Timestamp.fromDate(startDate!) : null,
      'endDate': endDate != null ? Timestamp.fromDate(endDate!) : null,
      'message': message,
      'temporaryHours': temporaryHours?.toMap(),
    };
  }

  // 今日が臨時営業変更期間かチェック
  bool get isActiveToday {
    final now = DateTime.now();
    if (startDate != null && endDate != null) {
      return now.isAfter(startDate!) && now.isBefore(endDate!.add(const Duration(days: 1)));
    }
    return false;
  }
}

class ShopModel {
  final String id;
  final String shopName;
  final String description;
  final String maniacPoint;
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
  final String? phone;
  final String? email;
  final String? closedDays;
  final WeeklyBusinessHours? businessHours;
  final List<String>? services;
  final TemporaryStatus? temporaryStatus;
  final DateTime createdAt;
  final DateTime updatedAt;

  ShopModel({
    required this.id,
    required this.shopName,
    required this.description,
    required this.maniacPoint,
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
    this.phone,
    this.email,
    this.closedDays,
    this.businessHours,
    this.services,
    this.temporaryStatus,
    required this.createdAt,
    required this.updatedAt,
  });

  static GeoPoint? _parseGeoPoint(dynamic data) {
    if (data == null) return null;
    if (data is GeoPoint) return data;
    if (data is Map<String, dynamic>) {
      // Mapから緯度経度を取得してGeoPointを作成
      final latitude = data['latitude'] ?? data['lat'] ?? data['_latitude'];
      final longitude = data['longitude'] ?? data['lng'] ?? data['_longitude'] ?? data['lon'];
      if (latitude != null && longitude != null) {
        final lat = latitude is num ? latitude.toDouble() : double.tryParse(latitude.toString());
        final lng = longitude is num ? longitude.toDouble() : double.tryParse(longitude.toString());
        
        // 有効な座標の場合のみGeoPointを作成
        if (lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return GeoPoint(lat, lng);
        }
      }
    }
    return null;
  }

  factory ShopModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>?;
    if (data == null) {
      throw Exception('Document data is null');
    }
    
    // デバッグ: 座標データを確認
    print('Shop ${doc.id} - location data: ${data['location']}');
    final location = _parseGeoPoint(data['location']);
    if (location != null) {
      print('Shop ${doc.id} - parsed location: lat=${location.latitude}, lng=${location.longitude}');
    }
    
    return ShopModel(
      id: doc.id,
      shopName: data['shopName'] ?? '',
      description: data['description'] ?? '',
      maniacPoint: data['maniacPoint'] ?? '',
      shopCategory: data['shopCategory'] ?? '',
      address: data['address'] ?? '',
      location: location,
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
      phone: data['phone'],
      email: data['email'],
      closedDays: data['closedDays'],
      businessHours: data['businessHours'] != null 
          ? WeeklyBusinessHours.fromMap(data['businessHours'])
          : null,
      services: data['services'] != null 
          ? List<String>.from(data['services']) 
          : null,
      temporaryStatus: data['temporaryStatus'] != null 
          ? TemporaryStatus.fromMap(data['temporaryStatus'])
          : null,
      createdAt: data['createdAt'] != null 
          ? (data['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
      updatedAt: data['updatedAt'] != null 
          ? (data['updatedAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'shopName': shopName,
      'description': description,
      'maniacPoint': maniacPoint,
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
      'phone': phone,
      'email': email,
      'closedDays': closedDays,
      'businessHours': businessHours?.toMap(),
      'services': services,
      'temporaryStatus': temporaryStatus?.toMap(),
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  // ヘルパーメソッド: 承認済みかどうかをチェック
  bool get isApproved => approvalStatus == 'approved';

  // ヘルパーメソッド: 今日の臨時営業状況をチェック
  bool get hasTemporaryStatusToday => 
      temporaryStatus != null && temporaryStatus!.isActiveToday;

  // ヘルパーメソッド: 今日が臨時休業かチェック
  bool get isTemporaryClosedToday => 
      hasTemporaryStatusToday && temporaryStatus!.isTemporaryClosed;

  // ヘルパーメソッド: 今日が時短営業かチェック
  bool get isReducedHoursToday => 
      hasTemporaryStatusToday && temporaryStatus!.isReducedHours;

  // ヘルパーメソッド: 今日の営業ステータスメッセージを取得
  String? get todayStatusMessage => 
      hasTemporaryStatusToday ? temporaryStatus!.message : null;
}