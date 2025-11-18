import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/shop_model.dart';
import '../widgets/favorite_button.dart';
import '../widgets/shop_filter_sheet.dart';
import '../widgets/shop_detail_sheet.dart';
import 'home_screen.dart';

class ShopListScreen extends StatefulWidget {
  const ShopListScreen({super.key});

  @override
  State<ShopListScreen> createState() => _ShopListScreenState();
}

class _ShopListScreenState extends State<ShopListScreen> {
  String _selectedCategory = 'すべて';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  ShopFilters _filters = ShopFilters();

  final List<String> _categories = [
    'すべて',
    '伝統工芸',
    '木彫',
    '飲食店',
    'カフェ',
    '雑貨店',
    'ギャラリー',
    'お土産',
    '衣料品',
    '公共施設',
    'その他',
  ];
  
  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ShopFilterSheet(
        initialFilters: _filters,
        onApply: (filters) {
          setState(() {
            _filters = filters;
          });
        },
      ),
    );
  }
  
  bool _isShopOpen(ShopModel shop) {
    if (shop.businessHours == null) return true; // 営業時間情報がない場合は表示
    
    final now = DateTime.now();
    final weekday = now.weekday;
    
    BusinessHours? todayHours;
    switch (weekday) {
      case 1:
        todayHours = shop.businessHours!.monday;
        break;
      case 2:
        todayHours = shop.businessHours!.tuesday;
        break;
      case 3:
        todayHours = shop.businessHours!.wednesday;
        break;
      case 4:
        todayHours = shop.businessHours!.thursday;
        break;
      case 5:
        todayHours = shop.businessHours!.friday;
        break;
      case 6:
        todayHours = shop.businessHours!.saturday;
        break;
      case 7:
        todayHours = shop.businessHours!.sunday;
        break;
    }
    
    if (todayHours == null || todayHours.closed) return false;
    
    if (todayHours.open == null || todayHours.close == null) return true;
    
    final openTime = _parseTime(todayHours.open!);
    final closeTime = _parseTime(todayHours.close!);
    final currentMinutes = now.hour * 60 + now.minute;
    
    return currentMinutes >= openTime && currentMinutes <= closeTime;
  }
  
  int _parseTime(String time) {
    final parts = time.split(':');
    if (parts.length != 2) return 0;
    final hour = int.tryParse(parts[0]) ?? 0;
    final minute = int.tryParse(parts[1]) ?? 0;
    return hour * 60 + minute;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('店舗一覧'),
        backgroundColor: Colors.blue,
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
          preferredSize: const Size.fromHeight(120),
          child: Column(
            children: [
              // 検索バー
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: '店舗名で検索...',
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
              
              // カテゴリー選択
              Container(
                height: 50,
                margin: const EdgeInsets.only(bottom: 8),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final category = _categories[index];
                    final isSelected = _selectedCategory == category;
                    
                    return Container(
                      margin: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(category),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            _selectedCategory = category;
                          });
                        },
                        backgroundColor: Colors.white,
                        selectedColor: Colors.blue.shade100,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.blue : Colors.grey.shade700,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('shops')
            .where('approvalStatus', isEqualTo: 'approved')
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            print('Shop list error: ${snapshot.error}');
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 48,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    const Text('データの読み込みに失敗しました'),
                    const SizedBox(height: 8),
                    Text(
                      '${snapshot.error}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          final shops = snapshot.data!.docs
              .map((doc) => ShopModel.fromFirestore(doc))
              .where((shop) {
                // カテゴリーフィルター
                if (_selectedCategory != 'すべて') {
                  if (_selectedCategory == '公共施設') {
                    // 公共施設カテゴリーの場合、駐車場、トイレ、案内所も含める
                    if (shop.shopCategory != '公共施設' && 
                        shop.shopCategory != '駐車場' && 
                        shop.shopCategory != 'トイレ' && 
                        shop.shopCategory != '案内所') {
                      return false;
                    }
                  } else if (shop.shopCategory != _selectedCategory) {
                    return false;
                  }
                }
                
                // 検索フィルター
                if (_searchQuery.isNotEmpty &&
                    !shop.shopName.toLowerCase().contains(_searchQuery.toLowerCase()) &&
                    !shop.description.toLowerCase().contains(_searchQuery.toLowerCase())) {
                  return false;
                }
                
                // 営業中フィルター
                if (_filters.openNowOnly && !_isShopOpen(shop)) {
                  return false;
                }
                
                // オンラインストアフィルター
                if (_filters.hasOnlineStore && (shop.onlineStore == null || shop.onlineStore!.isEmpty)) {
                  return false;
                }
                
                // 臨時営業変更フィルター
                if (_filters.hasTemporaryStatus && shop.temporaryStatus == null) {
                  return false;
                }
                
                // サービスフィルター
                if (_filters.selectedServices.isNotEmpty) {
                  final shopServices = shop.services ?? [];
                  for (final service in _filters.selectedServices) {
                    if (!shopServices.contains(service)) {
                      return false;
                    }
                  }
                }
                
                return true;
              })
              .toList();

          if (shops.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.store_outlined,
                    size: 64,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _searchQuery.isNotEmpty || _selectedCategory != 'すべて' || _filters.hasActiveFilters
                        ? '該当する店舗が見つかりません'
                        : '店舗が登録されていません',
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
                          _filters = ShopFilters();
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
            itemCount: shops.length,
            itemBuilder: (context, index) {
              final shop = shops[index];
              return ShopCard(shop: shop);
            },
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

class ShopCard extends StatefulWidget {
  final ShopModel shop;

  const ShopCard({
    super.key,
    required this.shop,
  });

  @override
  State<ShopCard> createState() => _ShopCardState();
}

class _ShopCardState extends State<ShopCard> {
  bool get isOpen => _isShopOpen(widget.shop);
  
  // カテゴリ表示名の変換
  String _getCategoryDisplayName(String category) {
    if (category == '駐車場' || category == 'トイレ' || category == '案内所') {
      return '公共施設';
    }
    return category;
  }
  
  bool _isShopOpen(ShopModel shop) {
    if (shop.businessHours == null) return true;
    
    final now = DateTime.now();
    final weekday = now.weekday;
    
    BusinessHours? todayHours;
    switch (weekday) {
      case 1:
        todayHours = shop.businessHours!.monday;
        break;
      case 2:
        todayHours = shop.businessHours!.tuesday;
        break;
      case 3:
        todayHours = shop.businessHours!.wednesday;
        break;
      case 4:
        todayHours = shop.businessHours!.thursday;
        break;
      case 5:
        todayHours = shop.businessHours!.friday;
        break;
      case 6:
        todayHours = shop.businessHours!.saturday;
        break;
      case 7:
        todayHours = shop.businessHours!.sunday;
        break;
    }
    
    if (todayHours == null || todayHours.closed) return false;
    
    if (todayHours.open == null || todayHours.close == null) return true;
    
    final openTime = _parseTime(todayHours.open!);
    final closeTime = _parseTime(todayHours.close!);
    final currentMinutes = now.hour * 60 + now.minute;
    
    return currentMinutes >= openTime && currentMinutes <= closeTime;
  }
  
  int _parseTime(String time) {
    final parts = time.split(':');
    if (parts.length != 2) return 0;
    final hour = int.tryParse(parts[0]) ?? 0;
    final minute = int.tryParse(parts[1]) ?? 0;
    return hour * 60 + minute;
  }

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
        onTap: () => _showShopDetail(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 店舗画像
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: widget.shop.images.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: widget.shop.images.first,
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
                            Icons.store,
                            size: 48,
                            color: Colors.grey,
                          ),
                        ),
                      )
                    : Container(
                        color: Colors.grey.shade200,
                        child: const Icon(
                          Icons.store,
                          size: 48,
                          color: Colors.grey,
                        ),
                      ),
                  ),
                ),
                // 営業状態表示
                if (widget.shop.businessHours != null)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isOpen ? Colors.green : Colors.red,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isOpen ? Icons.access_time : Icons.block,
                            color: Colors.white,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isOpen ? '営業中' : '営業時間外',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                // オンラインストア表示
                if (widget.shop.onlineStore != null && widget.shop.onlineStore!.isNotEmpty)
                  Positioned(
                    bottom: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.purple,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.shopping_cart,
                            color: Colors.white,
                            size: 14,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'オンライン',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            
            // 店舗情報
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.shop.shopName,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (widget.shop.temporaryStatus != null && 
                                (widget.shop.temporaryStatus!.isTemporaryClosed || 
                                 widget.shop.temporaryStatus!.isReducedHours)) ...
                              [
                                const SizedBox(height: 2),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.orange.shade100,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    widget.shop.temporaryStatus!.isTemporaryClosed
                                        ? '臨時休業'
                                        : '時短営業',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.orange.shade800,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                          ],
                        ),
                      ),
                      FavoriteButton(
                        itemType: 'shop',
                        itemId: widget.shop.id,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getCategoryDisplayName(widget.shop.shopCategory),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.shop.description,
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
                        Icons.location_on,
                        size: 16,
                        color: Colors.grey.shade600,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          widget.shop.address,
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

  void _showShopDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ShopDetailSheet(
        shop: widget.shop,
        onShowMap: () {
          // 現在の画面を閉じる
          Navigator.pop(context);
          
          // 地図タブに切り替えて店舗にフォーカス
          if (context.mounted) {
            HomeScreen.switchToTab(context, 2, focusShop: widget.shop);
          }
        },
      ),
    );
  }
}