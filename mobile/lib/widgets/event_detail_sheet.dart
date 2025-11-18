import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../models/event_model.dart';
import 'favorite_button.dart';

class EventDetailSheet extends StatelessWidget {
  final EventModel event;
  final VoidCallback? onShowMap;

  const EventDetailSheet({
    super.key,
    required this.event,
    this.onShowMap,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // ハンドル
              Container(
                margin: const EdgeInsets.only(top: 8),
                height: 4,
                width: 40,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // イベント名とお気に入りボタン
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                event.eventName,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              // カテゴリーとステータス
                              Row(
                                children: [
                                  if (event.eventCategory != null) ...[
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: Colors.green.shade100,
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Text(
                                        event.eventCategory!,
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.green.shade700,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                  ],
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _getProgressColor(event.eventProgress),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Text(
                                      _getProgressText(event.eventProgress),
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.white,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        FavoriteButton(
                          itemType: 'event',
                          itemId: event.id,
                          size: 32,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // イベント画像
                    if (event.images.isNotEmpty) ...[
                      SizedBox(
                        height: 200,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: event.images.length,
                          itemBuilder: (context, index) {
                            return Container(
                              margin: const EdgeInsets.only(right: 8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: CachedNetworkImage(
                                  imageUrl: event.images[index],
                                  width: 160,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    width: 160,
                                    color: Colors.grey.shade200,
                                    child: const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => Container(
                                    width: 160,
                                    color: Colors.grey.shade200,
                                    child: const Icon(Icons.error),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    
                    // 日時情報
                    const Text(
                      '開催期間',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, color: Colors.blue, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          '${DateFormat('yyyy年MM月dd日 HH:mm').format(event.eventTimeStart)} 〜',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const SizedBox(width: 28),
                        Text(
                          DateFormat('yyyy年MM月dd日 HH:mm').format(event.eventTimeEnd),
                          style: const TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                    
                    // 説明
                    if (event.description.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'イベント詳細',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        event.description,
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                    ],
                    
                    // 場所情報
                    const SizedBox(height: 16),
                    const Text(
                      '開催場所',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            event.location,
                            style: const TextStyle(fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                    
                    // 座標表示
                    if (event.coordinates != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.gps_fixed, color: Colors.blue, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '緯度: ${event.coordinates!.latitude}\n経度: ${event.coordinates!.longitude}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade700,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    
                    const SizedBox(height: 20),
                    
                    // ボタンセクション
                    // 地図で表示ボタン（onShowMapが指定されている場合のみ表示）
                    if (onShowMap != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: onShowMap,
                          icon: const Icon(Icons.map),
                          label: const Text('地図で表示'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    
                    // Googleマップで開く
                    if (event.googleMapUrl != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _launchUrl(event.googleMapUrl!),
                          icon: const Icon(Icons.map),
                          label: const Text('Googleマップで開く'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    
                    // 詳細URL
                    if (event.detailUrl != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () => _launchUrl(event.detailUrl!),
                          icon: const Icon(Icons.web),
                          label: const Text('詳細情報を見る'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                    
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Color _getProgressColor(String progress) {
    switch (progress) {
      case 'scheduled':
        return Colors.orange;
      case 'ongoing':
        return Colors.green;
      case 'ended':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }
  
  String _getProgressText(String progress) {
    switch (progress) {
      case 'scheduled':
        return '開催予定';
      case 'ongoing':
        return '開催中';
      case 'ended':
        return '終了';
      default:
        return progress;
    }
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      print('Could not launch $urlString');
    }
  }
}