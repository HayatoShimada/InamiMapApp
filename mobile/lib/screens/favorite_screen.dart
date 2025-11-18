import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/favorite_provider.dart';
import '../providers/auth_provider.dart';
import '../models/shop_model.dart';
import '../models/event_model.dart';
import '../widgets/favorite_button.dart';
import '../widgets/shop_detail_sheet.dart';
import '../widgets/event_detail_sheet.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'home_screen.dart';

class FavoriteScreen extends StatefulWidget {
  const FavoriteScreen({super.key});

  @override
  State<FavoriteScreen> createState() => _FavoriteScreenState();
}

class _FavoriteScreenState extends State<FavoriteScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (!authProvider.isAuthenticated) {
          return const Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.login,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'ログインが必要です',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('お気に入り'),
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
            actions: [
              IconButton(
                onPressed: () {
                  context.read<FavoriteProvider>().refresh();
                },
                icon: const Icon(Icons.refresh),
              ),
            ],
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              indicatorColor: Colors.white,
              tabs: [
                Consumer<FavoriteProvider>(
                  builder: (context, favoriteProvider, child) {
                    final shopCount = favoriteProvider.stats['shops'] ?? 0;
                    return Tab(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.store, size: 18),
                          const SizedBox(width: 4),
                          Text('店舗 ($shopCount)'),
                        ],
                      ),
                    );
                  },
                ),
                Consumer<FavoriteProvider>(
                  builder: (context, favoriteProvider, child) {
                    final eventCount = favoriteProvider.stats['events'] ?? 0;
                    return Tab(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.event, size: 18),
                          const SizedBox(width: 4),
                          Text('イベント ($eventCount)'),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              _buildShopTab(),
              _buildEventTab(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildShopTab() {
    return Consumer<FavoriteProvider>(
      builder: (context, favoriteProvider, child) {
        if (favoriteProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final shops = favoriteProvider.favoriteShops;

        if (shops.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.store_outlined,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'お気に入りの店舗がありません',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '店舗一覧からお気に入りを追加してください',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: shops.length,
          itemBuilder: (context, index) {
            return FavoriteShopCard(shop: shops[index]);
          },
        );
      },
    );
  }

  Widget _buildEventTab() {
    return Consumer<FavoriteProvider>(
      builder: (context, favoriteProvider, child) {
        if (favoriteProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final events = favoriteProvider.favoriteEvents;

        if (events.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.event_outlined,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'お気に入りのイベントがありません',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'イベント一覧からお気に入りを追加してください',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: events.length,
          itemBuilder: (context, index) {
            return FavoriteEventCard(event: events[index]);
          },
        );
      },
    );
  }
}

class FavoriteShopCard extends StatelessWidget {
  final ShopModel shop;

  const FavoriteShopCard({
    super.key,
    required this.shop,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => ShopDetailSheet(
              shop: shop,
              onShowMap: () {
                Navigator.pop(context);
                HomeScreen.switchToTab(context, 2, focusShop: shop);
              },
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // 店舗画像
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 80,
                  height: 80,
                  child: shop.images.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: shop.images.first,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            color: Colors.grey.shade200,
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                          errorWidget: (context, url, error) => Container(
                            color: Colors.grey.shade200,
                            child: const Icon(Icons.store, color: Colors.grey),
                          ),
                        )
                      : Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.store, color: Colors.grey),
                        ),
                ),
              ),
              
              const SizedBox(width: 12),
              
              // 店舗情報
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shop.shopName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        shop.shopCategory,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue.shade700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      shop.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              
              // お気に入りボタン
              FavoriteButton(
                itemType: 'shop',
                itemId: shop.id,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class FavoriteEventCard extends StatelessWidget {
  final EventModel event;

  const FavoriteEventCard({
    super.key,
    required this.event,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () {
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
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // イベント画像
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 80,
                  height: 80,
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
                            child: const Icon(Icons.event, color: Colors.grey),
                          ),
                        )
                      : Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.event, color: Colors.grey),
                        ),
                ),
              ),
              
              const SizedBox(width: 12),
              
              // イベント情報
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.eventName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    _buildStatusChip(),
                    const SizedBox(height: 4),
                    Text(
                      event.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDateTime(event.eventTimeStart),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
              
              // お気に入りボタン
              FavoriteButton(
                itemType: 'event',
                itemId: event.id,
              ),
            ],
          ),
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
    } else {
      backgroundColor = Colors.red.shade100;
      textColor = Colors.red.shade700;
      label = 'キャンセル';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          color: textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.year}/${dateTime.month}/${dateTime.day} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}