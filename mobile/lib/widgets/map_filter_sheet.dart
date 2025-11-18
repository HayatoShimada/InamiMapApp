import 'package:flutter/material.dart';

class MapFilters {
  String selectedType = 'すべて'; // すべて、店舗のみ、イベントのみ、公共施設のみ
  String selectedCategory = 'すべて';
  bool showOnlyOpen = false;
  bool showWithEvents = false;
  bool showOnlineStores = false;
  double? searchRadius; // km単位の検索半径
  
  MapFilters();
  
  MapFilters copyWith({
    String? selectedType,
    String? selectedCategory,
    bool? showOnlyOpen,
    bool? showWithEvents,
    bool? showOnlineStores,
    double? searchRadius,
  }) {
    return MapFilters()
      ..selectedType = selectedType ?? this.selectedType
      ..selectedCategory = selectedCategory ?? this.selectedCategory
      ..showOnlyOpen = showOnlyOpen ?? this.showOnlyOpen
      ..showWithEvents = showWithEvents ?? this.showWithEvents
      ..showOnlineStores = showOnlineStores ?? this.showOnlineStores
      ..searchRadius = searchRadius ?? this.searchRadius;
  }
  
  bool get hasActiveFilters {
    return selectedType != 'すべて' ||
        selectedCategory != 'すべて' ||
        showOnlyOpen ||
        showWithEvents ||
        showOnlineStores ||
        searchRadius != null;
  }
  
  int get activeFilterCount {
    int count = 0;
    if (selectedType != 'すべて') count++;
    if (selectedCategory != 'すべて') count++;
    if (showOnlyOpen) count++;
    if (showWithEvents) count++;
    if (showOnlineStores) count++;
    if (searchRadius != null) count++;
    return count;
  }
  
  void reset() {
    selectedType = 'すべて';
    selectedCategory = 'すべて';
    showOnlyOpen = false;
    showWithEvents = false;
    showOnlineStores = false;
    searchRadius = null;
  }
}

class MapFilterSheet extends StatefulWidget {
  final MapFilters initialFilters;
  final Function(MapFilters) onApply;
  
  const MapFilterSheet({
    super.key,
    required this.initialFilters,
    required this.onApply,
  });
  
  @override
  State<MapFilterSheet> createState() => _MapFilterSheetState();
}

class _MapFilterSheetState extends State<MapFilterSheet> {
  late MapFilters _filters;
  
  final List<String> _types = [
    'すべて',
    '店舗のみ',
    'イベントのみ',
    '公共施設のみ',
  ];
  
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
  
  final List<double> _radiusOptions = [0.5, 1.0, 2.0, 5.0, 10.0];
  
  @override
  void initState() {
    super.initState();
    _filters = widget.initialFilters.copyWith();
  }
  
  @override
  Widget build(BuildContext context) {
    final activeFilterCount = _filters.activeFilterCount;
    
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          // ヘッダー
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('キャンセル'),
                ),
                Text(
                  activeFilterCount > 0 ? '絞り込み ($activeFilterCount)' : '絞り込み',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _filters.reset();
                    });
                  },
                  child: const Text('リセット'),
                ),
              ],
            ),
          ),
          
          // フィルターコンテンツ
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // 表示タイプ
                _buildSectionTitle('表示タイプ'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _types.map((type) {
                    final isSelected = _filters.selectedType == type;
                    return ChoiceChip(
                      label: Text(type),
                      selected: isSelected,
                      onSelected: (selected) {
                        setState(() {
                          _filters.selectedType = type;
                          // タイプを変更した場合、カテゴリをリセット
                          if (type != 'すべて' && type != '店舗のみ') {
                            _filters.selectedCategory = 'すべて';
                          }
                        });
                      },
                      selectedColor: Colors.orange.shade100,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.orange.shade700 : Colors.grey.shade700,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    );
                  }).toList(),
                ),
                
                // カテゴリー（店舗のみ選択時）
                if (_filters.selectedType == '店舗のみ' || _filters.selectedType == 'すべて') ...[
                  const SizedBox(height: 24),
                  _buildSectionTitle('店舗カテゴリー'),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _categories.map((category) {
                      final isSelected = _filters.selectedCategory == category;
                      return ChoiceChip(
                        label: Text(category),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            _filters.selectedCategory = category;
                          });
                        },
                        selectedColor: Colors.blue.shade100,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.blue.shade700 : Colors.grey.shade700,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      );
                    }).toList(),
                  ),
                ],
                
                const SizedBox(height: 24),
                
                // 検索半径
                _buildSectionTitle('検索範囲'),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: const Text('指定なし'),
                        selected: _filters.searchRadius == null,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _filters.searchRadius = null;
                            });
                          }
                        },
                        selectedColor: Colors.green.shade100,
                      ),
                      const SizedBox(width: 8),
                      ..._radiusOptions.map((radius) {
                        final isSelected = _filters.searchRadius == radius;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text('${radius}km'),
                            selected: isSelected,
                            onSelected: (selected) {
                              setState(() {
                                _filters.searchRadius = selected ? radius : null;
                              });
                            },
                            selectedColor: Colors.green.shade100,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.green.shade700 : Colors.grey.shade700,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // その他のフィルター
                _buildSectionTitle('その他の条件'),
                const SizedBox(height: 8),
                
                if (_filters.selectedType == 'すべて' || _filters.selectedType == '店舗のみ') ...[
                  SwitchListTile(
                    title: const Text('営業中の店舗のみ'),
                    subtitle: const Text('現在営業している店舗を表示'),
                    value: _filters.showOnlyOpen,
                    onChanged: (value) {
                      setState(() {
                        _filters.showOnlyOpen = value;
                      });
                    },
                    activeColor: Colors.green,
                    contentPadding: EdgeInsets.zero,
                  ),
                  
                  SwitchListTile(
                    title: const Text('オンラインストアあり'),
                    subtitle: const Text('オンラインで購入可能な店舗'),
                    value: _filters.showOnlineStores,
                    onChanged: (value) {
                      setState(() {
                        _filters.showOnlineStores = value;
                      });
                    },
                    activeColor: Colors.purple,
                    contentPadding: EdgeInsets.zero,
                  ),
                  
                  SwitchListTile(
                    title: const Text('イベント開催店舗'),
                    subtitle: const Text('イベントを主催している店舗'),
                    value: _filters.showWithEvents,
                    onChanged: (value) {
                      setState(() {
                        _filters.showWithEvents = value;
                      });
                    },
                    activeColor: Colors.orange,
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ],
            ),
          ),
          
          // 適用ボタン
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  offset: const Offset(0, -2),
                  blurRadius: 4,
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: () {
                widget.onApply(_filters);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                activeFilterCount > 0
                    ? '絞り込みを適用 ($activeFilterCount)'
                    : '絞り込みを適用',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}