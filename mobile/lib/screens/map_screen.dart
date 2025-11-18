import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart' as geo;
import '../models/shop_model.dart';
import '../models/event_model.dart';
import '../widgets/favorite_button.dart';
import '../widgets/shop_detail_sheet.dart';
import '../widgets/event_detail_sheet.dart';
import '../widgets/map_filter_sheet.dart';

class MapScreen extends StatefulWidget {
  final ShopModel? focusShop;
  final EventModel? focusEvent;
  
  const MapScreen({super.key, this.focusShop, this.focusEvent});

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
  MapFilters _filters = MapFilters();
  LatLng? _userLocation;

  @override
  void initState() {
    super.initState();
    _loadMapData();
  }

  @override
  void didUpdateWidget(MapScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.focusShop != null && widget.focusShop != oldWidget.focusShop) {
      print('MapScreen didUpdateWidget: focusShop changed to ${widget.focusShop!.shopName}');
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && !_isLoading) {
          _centerOnShop(widget.focusShop!);
        }
      });
    }
    if (widget.focusEvent != null && widget.focusEvent != oldWidget.focusEvent) {
      print('MapScreen didUpdateWidget: focusEvent changed to ${widget.focusEvent!.eventName}');
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && !_isLoading) {
          _centerOnEvent(widget.focusEvent!);
        }
      });
    }
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

      // If there's a focus shop or event, center on it after data loads
      if (widget.focusShop != null && mounted) {
        print('MapScreen: Centering on shop after data load');
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _centerOnShop(widget.focusShop!);
        });
      } else if (widget.focusEvent != null && mounted) {
        print('MapScreen: Centering on event after data load');
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _centerOnEvent(widget.focusEvent!);
        });
      }
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
  
  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => MapFilterSheet(
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('地図'),
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
                      maxZoom: 19.0, // 最大ズームレベルを上げる
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        subdomains: const ['a', 'b', 'c'], // サブドメインを使用して並列読み込み
                        userAgentPackageName: 'com.inamimapapp.inami_map_app',
                        maxZoom: 19,
                        retinaMode: true, // Retinaディスプレイ対応
                        keepBuffer: 8, // タイルバッファを増やす
                        tileSize: 256,
                        minZoom: 10,
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
    if (_filters.selectedType == 'すべて' || _filters.selectedType == '店舗のみ') {
      for (final shop in _shops) {
        if (shop.location != null && _shouldShowShop(shop)) {
          markers.add(
            Marker(
              point: LatLng(shop.location!.latitude, shop.location!.longitude),
              width: 40,
              height: 40,
              child: GestureDetector(
                onTap: () => _showShopDetails(shop),
                child: Icon(
                  _getShopIcon(shop.shopCategory),
                  color: _getShopIconColor(shop.shopCategory),
                  size: 40,
                ),
              ),
            ),
          );
        }
      }
    }

    // イベントマーカー
    if (_filters.selectedType == 'すべて' || _filters.selectedType == 'イベントのみ') {
      for (final event in _events) {
        // イベント自体に座標がある場合はそれを優先
        if (event.coordinates != null) {
          markers.add(
            Marker(
              point: LatLng(
                event.coordinates!.latitude,
                event.coordinates!.longitude,
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
        // イベントに座標がない場合、参加店舗の座標を使用
        else if (event.participatingShops != null && event.participatingShops!.isNotEmpty) {
          // 参加店舗の中から有効な座標を持つ店舗を探す
          for (final shopId in event.participatingShops!) {
            final shop = _shops.firstWhere(
              (s) => s.id == shopId,
              orElse: () => ShopModel(
                id: '',
                shopName: '',
                description: '',
                maniacPoint: '',
                shopCategory: '',
                address: '',
                images: [],
                ownerUserId: '',
                approvalStatus: '',
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              ),
            );
            
            if (shop.id.isNotEmpty && shop.location != null) {
              markers.add(
                Marker(
                  point: LatLng(
                    shop.location!.latitude,
                    shop.location!.longitude,
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
              break; // 最初の有効な店舗の座標を使用
            }
          }
        }
        // 主催店舗がある場合はその座標を使用
        else if (event.shopId != null && event.shopId!.isNotEmpty) {
          final hostShop = _shops.firstWhere(
            (shop) => shop.id == event.shopId,
            orElse: () => ShopModel(
              id: '',
              shopName: '',
              description: '',
              maniacPoint: '',
              shopCategory: '',
              address: '',
              images: [],
              ownerUserId: '',
              approvalStatus: '',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
          );
          
          if (hostShop.id.isNotEmpty && hostShop.location != null) {
            markers.add(
              Marker(
                point: LatLng(
                  hostShop.location!.latitude,
                  hostShop.location!.longitude,
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
  
  bool _shouldShowShop(ShopModel shop) {
    // カテゴリフィルター
    if (_filters.selectedCategory != 'すべて') {
      if (_filters.selectedCategory == '公共施設') {
        // 公共施設カテゴリーの場合、駐車場、トイレ、案内所も含める
        if (shop.shopCategory != '公共施設' && 
            shop.shopCategory != '駐車場' && 
            shop.shopCategory != 'トイレ' && 
            shop.shopCategory != '案内所') {
          return false;
        }
      } else if (shop.shopCategory != _filters.selectedCategory) {
        return false;
      }
    }
    
    // 公共施設のみフィルター
    if (_filters.selectedType == '公共施設のみ') {
      if (shop.shopCategory != '公共施設' && 
          shop.shopCategory != '駐車場' && 
          shop.shopCategory != 'トイレ' && 
          shop.shopCategory != '案内所') {
        return false;
      }
    }
    
    // 営業中フィルター
    if (_filters.showOnlyOpen) {
      if (!_isShopOpen(shop)) {
        return false;
      }
    }
    
    // オンラインストアフィルター
    if (_filters.showOnlineStores) {
      if (shop.onlineStore == null || shop.onlineStore!.isEmpty) {
        return false;
      }
    }
    
    // イベント開催店舗フィルター
    if (_filters.showWithEvents) {
      bool hasEvent = false;
      for (final event in _events) {
        if (event.shopId == shop.id || 
            (event.participatingShops != null && event.participatingShops!.contains(shop.id))) {
          hasEvent = true;
          break;
        }
      }
      if (!hasEvent) {
        return false;
      }
    }
    
    // 検索範囲フィルター
    if (_filters.searchRadius != null && _userLocation != null) {
      final distance = const Distance().as(
        LengthUnit.Kilometer,
        _userLocation!,
        LatLng(shop.location!.latitude, shop.location!.longitude),
      );
      if (distance > _filters.searchRadius!) {
        return false;
      }
    }
    
    return true;
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

  Widget _buildItemsList() {
    final filteredShops = (_filters.selectedType == 'すべて' || _filters.selectedType == '店舗のみ' || _filters.selectedType == '公共施設のみ')
        ? _shops.where(_shouldShowShop).toList()
        : <ShopModel>[];
    final filteredEvents = (_filters.selectedType == 'すべて' || _filters.selectedType == 'イベントのみ')
        ? _events
        : <EventModel>[];
    
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

  // カテゴリに応じたアイコンを返す
  IconData _getShopIcon(String category) {
    switch (category) {
      case '駐車場':
        return Icons.local_parking;
      case 'トイレ':
        return Icons.wc;
      case '案内所':
        return Icons.info_outline;
      default:
        return Icons.store;
    }
  }
  
  // カテゴリに応じたアイコンカラーを返す
  Color _getShopIconColor(String category) {
    switch (category) {
      case '駐車場':
        return Colors.orange;
      case 'トイレ':
        return Colors.teal;
      case '案内所':
        return Colors.purple;
      default:
        return Colors.blue;
    }
  }

  void _centerOnInami() {
    _mapController.move(_inamiCenter, 13.0);
  }

  void _centerOnShop(ShopModel shop) {
    print('_centerOnShop called: ${shop.shopName}');
    if (shop.location != null) {
      print('Shop location: lat=${shop.location!.latitude}, lng=${shop.location!.longitude}');
      
      // 即座に低いズームレベルで移動してから、高いズームレベルに移動
      if (mounted) {
        // まず低いズームレベルで中心を移動
        _mapController.move(
          LatLng(shop.location!.latitude, shop.location!.longitude),
          15.0,
        );
        
        // 少し待ってから高いズームレベルに移動
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted) {
            _mapController.move(
              LatLng(shop.location!.latitude, shop.location!.longitude),
              18.0,
            );
            
            // 強制的に再描画
            setState(() {});
          }
        });
      }
    } else {
      print('Shop location is null');
    }
  }

  void _centerOnEvent(EventModel event) {
    print('_centerOnEvent called: ${event.eventName}');
    // イベント自体に座標がある場合はそれを優先
    if (event.coordinates != null) {
      print('Event has coordinates: lat=${event.coordinates!.latitude}, lng=${event.coordinates!.longitude}');
      if (mounted) {
        // まず低いズームレベルで中心を移動
        _mapController.move(
          LatLng(event.coordinates!.latitude, event.coordinates!.longitude),
          15.0,
        );
        
        // 少し待ってから高いズームレベルに移動
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted) {
            _mapController.move(
              LatLng(event.coordinates!.latitude, event.coordinates!.longitude),
              18.0,
            );
            
            // 強制的に再描画
            setState(() {});
          }
        });
      }
    }
    // イベントに座標がない場合、参加店舗の座標を使用
    else if (event.participatingShops != null && event.participatingShops!.isNotEmpty) {
      print('Event has participatingShops: ${event.participatingShops}');
      final participatingShop = _shops.firstWhere(
        (shop) => event.participatingShops!.contains(shop.id),
        orElse: () => _shops.first,
      );
      
      if (participatingShop.location != null) {
        print('Using participating shop location: lat=${participatingShop.location!.latitude}, lng=${participatingShop.location!.longitude}');
        if (mounted) {
          // まず低いズームレベルで中心を移動
          _mapController.move(
            LatLng(participatingShop.location!.latitude, participatingShop.location!.longitude),
            15.0,
          );
          
          // 少し待ってから高いズームレベルに移動
          Future.delayed(const Duration(milliseconds: 100), () {
            if (mounted) {
              _mapController.move(
                LatLng(participatingShop.location!.latitude, participatingShop.location!.longitude),
                18.0,
              );
              
              // 強制的に再描画
              setState(() {});
            }
          });
        }
      }
    } else {
      print('Event has no location information');
    }
  }

  void _showShopDetails(ShopModel shop) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ShopDetailSheet(
        shop: shop,
        onShowMap: () {
          Navigator.pop(context);
          _centerOnShop(shop);
        },
      ),
    );
  }

  void _showEventDetails(EventModel event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EventDetailSheet(
        event: event,
        onShowMap: () {
          Navigator.pop(context);
          _centerOnEvent(event);
        },
      ),
    );
  }
}