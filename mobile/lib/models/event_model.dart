import 'package:cloud_firestore/cloud_firestore.dart';

class EventModel {
  final String id;
  final String eventName;
  final String description;
  final String eventCategory; // イベントカテゴリ
  final String location;
  final DateTime eventTimeStart;
  final DateTime eventTimeEnd;
  final String eventProgress; // scheduled, ongoing, finished, cancelled
  final String approvalStatus; // pending, approved, rejected
  final List<String> images;
  final List<String>? participatingShops;
  final String? detailUrl; // イベント詳細URL
  final String ownerUserId;
  final DateTime createdAt;
  final DateTime? approvedAt;
  final DateTime? rejectedAt;
  final String? rejectionReason;

  EventModel({
    required this.id,
    required this.eventName,
    required this.description,
    this.eventCategory = 'その他',
    required this.location,
    required this.eventTimeStart,
    required this.eventTimeEnd,
    required this.eventProgress,
    required this.approvalStatus,
    required this.images,
    this.participatingShops,
    this.detailUrl,
    required this.ownerUserId,
    required this.createdAt,
    this.approvedAt,
    this.rejectedAt,
    this.rejectionReason,
  });

  factory EventModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return EventModel(
      id: doc.id,
      eventName: data['eventName'] ?? '',
      description: data['description'] ?? '',
      eventCategory: data['eventCategory'] ?? 'その他',
      location: data['location'] ?? '',
      eventTimeStart: (data['eventTimeStart'] as Timestamp).toDate(),
      eventTimeEnd: (data['eventTimeEnd'] as Timestamp).toDate(),
      eventProgress: data['eventProgress'] ?? 'scheduled',
      approvalStatus: data['approvalStatus'] ?? 'pending',
      images: data['images'] != null 
          ? List<String>.from(data['images']) 
          : [],
      participatingShops: data['participatingShops'] != null
          ? List<String>.from(data['participatingShops'])
          : null,
      detailUrl: data['detailUrl'],
      ownerUserId: data['ownerUserId'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      approvedAt: data['approvedAt'] != null 
          ? (data['approvedAt'] as Timestamp).toDate() 
          : null,
      rejectedAt: data['rejectedAt'] != null 
          ? (data['rejectedAt'] as Timestamp).toDate() 
          : null,
      rejectionReason: data['rejectionReason'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'eventName': eventName,
      'description': description,
      'eventCategory': eventCategory,
      'location': location,
      'eventTimeStart': Timestamp.fromDate(eventTimeStart),
      'eventTimeEnd': Timestamp.fromDate(eventTimeEnd),
      'eventProgress': eventProgress,
      'approvalStatus': approvalStatus,
      'images': images,
      'participatingShops': participatingShops,
      if (detailUrl != null) 'detailUrl': detailUrl,
      'ownerUserId': ownerUserId,
      'createdAt': Timestamp.fromDate(createdAt),
      if (approvedAt != null) 'approvedAt': Timestamp.fromDate(approvedAt!),
      if (rejectedAt != null) 'rejectedAt': Timestamp.fromDate(rejectedAt!),
      if (rejectionReason != null) 'rejectionReason': rejectionReason,
    };
  }

  bool get isApproved => approvalStatus == 'approved';
  bool get isPending => approvalStatus == 'pending';
  bool get isRejected => approvalStatus == 'rejected';
  
  bool get isScheduled => eventProgress == 'scheduled';
  bool get isOngoing => eventProgress == 'ongoing';
  bool get isFinished => eventProgress == 'finished';
  bool get isCancelled => eventProgress == 'cancelled';
}