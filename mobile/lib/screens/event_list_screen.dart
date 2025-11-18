import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/event_model.dart';
import '../widgets/favorite_button.dart';
import '../widgets/event_detail_sheet.dart';
import '../widgets/event_filter_sheet.dart';
import 'home_screen.dart';

class EventListScreen extends StatefulWidget {
  const EventListScreen({super.key});

  @override
  State<EventListScreen> createState() => _EventListScreenState();
}

class _EventListScreenState extends State<EventListScreen> {
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  EventFilters _filters = EventFilters();

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EventFilterSheet(
        initialFilters: _filters,
        onApply: (filters) {
          setState(() {
            _filters = filters;
          });
        },
      ),
    );
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('イベント一覧'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.filter_list),
                onPressed: _showFilterSheet,
              ),
              if (_filters.hasActiveFilters)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${_filters.activeFilterCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'イベント名で検索...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (query) {
                setState(() {
                  _searchQuery = query;
                });
              },
            ),
          ),
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('events')
            .where('approvalStatus', isEqualTo: 'approved')
            .orderBy('eventTimeStart', descending: false)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(
              child: Text('エラーが発生しました'),
            );
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          final events = snapshot.data!.docs
              .map((doc) => EventModel.fromFirestore(doc))
              .where((event) {
                // 検索フィルター
                if (_searchQuery.isNotEmpty &&
                    !event.eventName.toLowerCase().contains(_searchQuery.toLowerCase()) &&
                    !event.description.toLowerCase().contains(_searchQuery.toLowerCase())) {
                  return false;
                }
                
                // カテゴリフィルター
                if (_filters.selectedCategory != 'すべて' && event.eventCategory != _filters.selectedCategory) {
                  return false;
                }
                
                // 進行状況フィルター
                if (_filters.selectedProgress != 'すべて') {
                  switch (_filters.selectedProgress) {
                    case '開催予定':
                      if (!event.isScheduled) return false;
                      break;
                    case '開催中':
                      if (!event.isOngoing) return false;
                      break;
                    case '終了':
                      if (!event.isFinished) return false;
                      break;
                    case '中止':
                      if (!event.isCancelled) return false;
                      break;
                  }
                }
                
                // 日付フィルター
                final now = DateTime.now();
                
                if (_filters.todayOnly) {
                  final startOfDay = DateTime(now.year, now.month, now.day);
                  final endOfDay = DateTime(now.year, now.month, now.day, 23, 59, 59);
                  if (event.eventTimeEnd.isBefore(startOfDay) || event.eventTimeStart.isAfter(endOfDay)) {
                    return false;
                  }
                } else if (_filters.thisWeekOnly) {
                  final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
                  final endOfWeek = startOfWeek.add(const Duration(days: 6, hours: 23, minutes: 59, seconds: 59));
                  if (event.eventTimeEnd.isBefore(startOfWeek) || event.eventTimeStart.isAfter(endOfWeek)) {
                    return false;
                  }
                } else if (_filters.thisMonthOnly) {
                  final startOfMonth = DateTime(now.year, now.month, 1);
                  final endOfMonth = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
                  if (event.eventTimeEnd.isBefore(startOfMonth) || event.eventTimeStart.isAfter(endOfMonth)) {
                    return false;
                  }
                } else {
                  // カスタム日付範囲
                  if (_filters.startDate != null && event.eventTimeEnd.isBefore(_filters.startDate!)) {
                    return false;
                  }
                  if (_filters.endDate != null) {
                    final endOfDay = DateTime(_filters.endDate!.year, _filters.endDate!.month, _filters.endDate!.day, 23, 59, 59);
                    if (event.eventTimeStart.isAfter(endOfDay)) {
                      return false;
                    }
                  }
                }
                
                // 参加店舗フィルター
                if (_filters.hasParticipatingShops && (event.participatingShops == null || event.participatingShops!.isEmpty)) {
                  return false;
                }
                
                return true;
              })
              .toList();

          if (events.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_outlined,
                    size: 64,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _searchQuery.isNotEmpty || _filters.hasActiveFilters
                        ? '該当するイベントがありません'
                        : 'イベントが登録されていません',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  if (_filters.hasActiveFilters) ...[
                    const SizedBox(height: 16),
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _filters = EventFilters();
                        });
                      },
                      icon: const Icon(Icons.clear),
                      label: const Text('フィルターをクリア'),
                    ),
                  ],
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: events.length,
            itemBuilder: (context, index) {
              final event = events[index];
              return EventCard(event: event);
            },
          );
        },
      ),
    );
  }
}

class EventCard extends StatelessWidget {
  final EventModel event;

  const EventCard({
    super.key,
    required this.event,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showEventDetail(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // イベント画像
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: event.images.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: event.images.first,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.grey.shade200,
                          child: const Center(
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey.shade200,
                          child: const Icon(
                            Icons.event,
                            size: 48,
                            color: Colors.grey,
                          ),
                        ),
                      )
                    : Container(
                        color: Colors.grey.shade200,
                        child: const Icon(
                          Icons.event,
                          size: 48,
                          color: Colors.grey,
                        ),
                      ),
              ),
            ),
            
            // イベント情報
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          event.eventName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      FavoriteButton(
                        itemType: 'event',
                        itemId: event.id,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      _buildStatusChip(),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.purple.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          event.eventCategory,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.purple.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    event.description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.schedule,
                        size: 16,
                        color: Colors.grey.shade600,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${_formatDateTime(event.eventTimeStart)} - ${_formatDateTime(event.eventTimeEnd)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 16,
                        color: Colors.grey.shade600,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          event.location,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip() {
    Color backgroundColor;
    Color textColor;
    String label;

    if (event.isScheduled) {
      backgroundColor = Colors.blue.shade100;
      textColor = Colors.blue.shade700;
      label = '開催予定';
    } else if (event.isOngoing) {
      backgroundColor = Colors.green.shade100;
      textColor = Colors.green.shade700;
      label = '開催中';
    } else if (event.isFinished) {
      backgroundColor = Colors.grey.shade100;
      textColor = Colors.grey.shade700;
      label = '終了';
    } else if (event.isCancelled) {
      backgroundColor = Colors.red.shade100;
      textColor = Colors.red.shade700;
      label = 'キャンセル';
    } else {
      backgroundColor = Colors.grey.shade100;
      textColor = Colors.grey.shade700;
      label = '不明';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          color: textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.month}/${dateTime.day} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  void _showEventDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EventDetailSheet(
        event: event,
        onShowMap: () {
          // 現在の画面を閉じる
          Navigator.pop(context);
          
          // 地図タブに切り替えてイベントにフォーカス
          if (context.mounted) {
            HomeScreen.switchToTab(context, 2, focusEvent: event);
          }
        },
      ),
    );
  }
}