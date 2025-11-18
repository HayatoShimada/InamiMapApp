import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/shop_model.dart';
import '../models/event_model.dart';
import '../widgets/favorite_button.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  
  // 井波町の中心座標
  static const LatLng _inamiCenter = LatLng(36.5569, 136.9628);
  
  List<ShopModel> _shops = [];
  List<EventModel> _events = [];
  bool _isLoading = true;
  String _selectedFilter = 'すべて';

  @override
  void initState() {
    super.initState();
    _loadMapData();
  }

  Future<void> _loadMapData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // 承認済み店舗データを取得
      final shopsSnapshot = await FirebaseFirestore.instance
          .collection('shops')
          .where('approvalStatus', isEqualTo: 'approved')
          .get();

      // 承認済みイベントデータを取得
      final eventsSnapshot = await FirebaseFirestore.instance
          .collection('events')
          .where('approvalStatus', isEqualTo: 'approved')
          .get();

      setState(() {
        _shops = shopsSnapshot.docs
            .map((doc) => ShopModel.fromFirestore(doc))
            .toList();
        _events = eventsSnapshot.docs
            .map((doc) => EventModel.fromFirestore(doc))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading map data: $e');
      print('Error type: ${e.runtimeType}');
      if (e is FirebaseException) {
        print('Firebase error code: ${e.code}');
        print('Firebase error message: ${e.message}');
      }
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('データの読み込みに失敗しました: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('地図'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () => _centerOnInami(),
            tooltip: '井波町を中心に表示',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadMapData,
            tooltip: '更新',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            height: 50,
            margin: const EdgeInsets.only(bottom: 8),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                'すべて',
                '店舗のみ',
                'イベントのみ',
              ].map((filter) {
                final isSelected = _selectedFilter == filter;
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _selectedFilter = filter;
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
              }).toList(),
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  flex: 3,
                  child: FlutterMap(
                    mapController: _mapController,
                    options: const MapOptions(
                      initialCenter: _inamiCenter,
                      initialZoom: 13.0,
                      minZoom: 10.0,
                      maxZoom: 18.0,
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.inamimapapp.inami_map_app',
                      ),
                      MarkerLayer(
                        markers: _buildMarkers(),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: _buildItemsList(),
                ),
              ],
            ),
    );
  }

  List<Marker> _buildMarkers() {
    List<Marker> markers = [];

    // 店舗マーカー
    if (_selectedFilter == 'すべて' || _selectedFilter == '店舗のみ') {
      for (final shop in _shops) {
        if (shop.location != null) {
          markers.add(
            Marker(
              point: LatLng(shop.location!.latitude, shop.location!.longitude),
              width: 40,
              height: 40,
              child: GestureDetector(
                onTap: () => _showShopDetails(shop),
                child: const Icon(
                  Icons.store,
                  color: Colors.blue,
                  size: 40,
                ),
              ),
            ),
          );
        }
      }
    }

    // イベントマーカー
    if (_selectedFilter == 'すべて' || _selectedFilter == 'イベントのみ') {
      for (final event in _events) {
        // イベントの場所が参加店舗に基づく場合
        if (event.participatingShops != null && event.participatingShops!.isNotEmpty) {
          final participatingShop = _shops.firstWhere(
            (shop) => event.participatingShops!.contains(shop.id),
            orElse: () => _shops.first,
          );
          
          if (participatingShop.location != null) {
            markers.add(
              Marker(
                point: LatLng(
                  participatingShop.location!.latitude,
                  participatingShop.location!.longitude,
                ),
                width: 40,
                height: 40,
                child: GestureDetector(
                  onTap: () => _showEventDetails(event),
                  child: const Icon(
                    Icons.event,
                    color: Colors.green,
                    size: 40,
                  ),
                ),
              ),
            );
          }
        }
      }
    }

    return markers;
  }

  Widget _buildItemsList() {
    final filteredShops = _selectedFilter == 'イベントのみ' ? <ShopModel>[] : _shops;
    final filteredEvents = _selectedFilter == '店舗のみ' ? <EventModel>[] : _events;
    
    final totalItems = filteredShops.length + filteredEvents.length;

    if (totalItems == 0) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.location_off, size: 48, color: Colors.grey),
            SizedBox(height: 16),
            Text('表示するアイテムがありません'),
            Text('フィルターを変更するか、更新してみてください'),
          ],
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: Text(
              '地図上のアイテム ($totalItems)',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: ListView(
              children: [
                ...filteredShops.map((shop) => ListTile(
                  leading: const Icon(Icons.store, color: Colors.blue),
                  title: Text(shop.shopName),
                  subtitle: Text(shop.shopCategory),
                  trailing: FavoriteButton(
                    itemType: 'shop',
                    itemId: shop.id,
                    size: 20,
                  ),
                  onTap: () => _centerOnShop(shop),
                )),
                ...filteredEvents.map((event) => ListTile(
                  leading: const Icon(Icons.event, color: Colors.green),
                  title: Text(event.eventName),
                  subtitle: Text(event.location),
                  trailing: FavoriteButton(
                    itemType: 'event',
                    itemId: event.id,
                    size: 20,
                  ),
                  onTap: () => _centerOnEvent(event),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _centerOnInami() {
    _mapController.move(_inamiCenter, 13.0);
  }

  void _centerOnShop(ShopModel shop) {
    if (shop.location != null) {
      _mapController.move(
        LatLng(shop.location!.latitude, shop.location!.longitude),
        17.0,
      );
    }
  }

  void _centerOnEvent(EventModel event) {
    if (event.participatingShops != null && event.participatingShops!.isNotEmpty) {
      final participatingShop = _shops.firstWhere(
        (shop) => event.participatingShops!.contains(shop.id),
        orElse: () => _shops.first,
      );
      
      if (participatingShop.location != null) {
        _mapController.move(
          LatLng(
            participatingShop.location!.latitude,
            participatingShop.location!.longitude,
          ),
          17.0,
        );
      }
    }
  }

  void _showShopDetails(ShopModel shop) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildShopDetailSheet(shop),
    );
  }

  void _showEventDetails(EventModel event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildEventDetailSheet(event),
    );
  }

  Widget _buildShopDetailSheet(ShopModel shop) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.3,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
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
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.store, color: Colors.blue, size: 32),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              shop.shopName,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          FavoriteButton(
                            itemType: 'shop',
                            itemId: shop.id,
                            size: 32,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        shop.description,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.red),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              shop.address,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            _centerOnShop(shop);
                          },
                          icon: const Icon(Icons.center_focus_strong),
                          label: const Text('地図で表示'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEventDetailSheet(EventModel event) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.3,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
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
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.event, color: Colors.green, size: 32),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              event.eventName,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
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
                      Text(
                        event.description,
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.schedule, color: Colors.blue),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${_formatDateTime(event.eventTimeStart)} - ${_formatDateTime(event.eventTimeEnd)}',
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.red),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              event.location,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            _centerOnEvent(event);
                          },
                          icon: const Icon(Icons.center_focus_strong),
                          label: const Text('地図で表示'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.month}/${dateTime.day} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}