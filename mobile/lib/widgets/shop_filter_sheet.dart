import 'package:flutter/material.dart';

class ShopFilters {
  final List<String> selectedServices;
  final bool openNowOnly;
  final bool hasOnlineStore;
  final bool hasTemporaryStatus;

  ShopFilters({
    this.selectedServices = const [],
    this.openNowOnly = false,
    this.hasOnlineStore = false,
    this.hasTemporaryStatus = false,
  });

  ShopFilters copyWith({
    List<String>? selectedServices,
    bool? openNowOnly,
    bool? hasOnlineStore,
    bool? hasTemporaryStatus,
  }) {
    return ShopFilters(
      selectedServices: selectedServices ?? this.selectedServices,
      openNowOnly: openNowOnly ?? this.openNowOnly,
      hasOnlineStore: hasOnlineStore ?? this.hasOnlineStore,
      hasTemporaryStatus: hasTemporaryStatus ?? this.hasTemporaryStatus,
    );
  }

  bool get hasActiveFilters =>
      selectedServices.isNotEmpty ||
      openNowOnly ||
      hasOnlineStore ||
      hasTemporaryStatus;

  int get activeFilterCount {
    int count = selectedServices.length;
    if (openNowOnly) count++;
    if (hasOnlineStore) count++;
    if (hasTemporaryStatus) count++;
    return count;
  }
}

class ShopFilterSheet extends StatefulWidget {
  final ShopFilters initialFilters;
  final Function(ShopFilters) onApply;

  const ShopFilterSheet({
    super.key,
    required this.initialFilters,
    required this.onApply,
  });

  @override
  State<ShopFilterSheet> createState() => _ShopFilterSheetState();
}

class _ShopFilterSheetState extends State<ShopFilterSheet> {
  late ShopFilters _filters;
  
  final List<Map<String, dynamic>> _availableServices = [
    {'id': 'parking', 'name': '駐車場', 'icon': Icons.local_parking},
    {'id': 'card_payment', 'name': 'カード決済', 'icon': Icons.credit_card},
    {'id': 'electronic_money', 'name': '電子マネー', 'icon': Icons.payment},
    {'id': 'qr_payment', 'name': 'QR決済', 'icon': Icons.qr_code},
    {'id': 'wifi', 'name': 'Wi-Fi', 'icon': Icons.wifi},
    {'id': 'toilet', 'name': 'トイレ', 'icon': Icons.wc},
    {'id': 'barrier_free', 'name': 'バリアフリー', 'icon': Icons.accessible},
    {'id': 'pet_allowed', 'name': 'ペット可', 'icon': Icons.pets},
    {'id': 'smoking_area', 'name': '喫煙所', 'icon': Icons.smoking_rooms},
    {'id': 'private_room', 'name': '個室', 'icon': Icons.meeting_room},
    {'id': 'reservation', 'name': '予約可', 'icon': Icons.book_online},
    {'id': 'takeout', 'name': 'テイクアウト', 'icon': Icons.takeout_dining},
    {'id': 'delivery', 'name': 'デリバリー', 'icon': Icons.delivery_dining},
    {'id': 'english_support', 'name': '英語対応', 'icon': Icons.language},
    {'id': 'chinese_support', 'name': '中国語対応', 'icon': Icons.translate},
  ];

  @override
  void initState() {
    super.initState();
    _filters = widget.initialFilters;
  }

  void _resetFilters() {
    setState(() {
      _filters = ShopFilters();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
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
          
          // ヘッダー
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.filter_list, size: 24),
                    const SizedBox(width: 8),
                    const Text(
                      '絞り込み',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (_filters.hasActiveFilters) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_filters.activeFilterCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                TextButton(
                  onPressed: _resetFilters,
                  child: const Text('リセット'),
                ),
              ],
            ),
          ),
          
          const Divider(height: 1),
          
          // フィルター内容
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                // 営業状態
                _buildSection(
                  title: '営業状態',
                  icon: Icons.schedule,
                  children: [
                    CheckboxListTile(
                      title: const Text('現在営業中のみ'),
                      subtitle: const Text('現在の時刻で営業している店舗'),
                      value: _filters.openNowOnly,
                      onChanged: (value) {
                        setState(() {
                          _filters = _filters.copyWith(openNowOnly: value);
                        });
                      },
                    ),
                    CheckboxListTile(
                      title: const Text('臨時営業変更あり'),
                      subtitle: const Text('臨時休業・時短営業など'),
                      value: _filters.hasTemporaryStatus,
                      onChanged: (value) {
                        setState(() {
                          _filters = _filters.copyWith(hasTemporaryStatus: value);
                        });
                      },
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // オンライン対応
                _buildSection(
                  title: 'オンライン対応',
                  icon: Icons.language,
                  children: [
                    CheckboxListTile(
                      title: const Text('オンラインストアあり'),
                      subtitle: const Text('通販・ECサイト対応'),
                      value: _filters.hasOnlineStore,
                      onChanged: (value) {
                        setState(() {
                          _filters = _filters.copyWith(hasOnlineStore: value);
                        });
                      },
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // サービス・設備
                _buildSection(
                  title: 'サービス・設備',
                  icon: Icons.storefront,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _availableServices.map((service) {
                          final isSelected = _filters.selectedServices.contains(service['id']);
                          return FilterChip(
                            label: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  service['icon'] as IconData,
                                  size: 16,
                                  color: isSelected ? Colors.white : Colors.grey.shade700,
                                ),
                                const SizedBox(width: 4),
                                Text(service['name'] as String),
                              ],
                            ),
                            selected: isSelected,
                            onSelected: (selected) {
                              setState(() {
                                final services = List<String>.from(_filters.selectedServices);
                                if (selected) {
                                  services.add(service['id'] as String);
                                } else {
                                  services.remove(service['id']);
                                }
                                _filters = _filters.copyWith(selectedServices: services);
                              });
                            },
                            selectedColor: Colors.blue,
                            checkmarkColor: Colors.white,
                            backgroundColor: Colors.grey.shade100,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : Colors.grey.shade700,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // ボタン
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('キャンセル'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        widget.onApply(_filters);
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(
                        _filters.hasActiveFilters 
                            ? '適用する (${_filters.activeFilterCount})' 
                            : '適用する',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Icon(icon, size: 20, color: Colors.grey.shade700),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        ...children,
      ],
    );
  }
}