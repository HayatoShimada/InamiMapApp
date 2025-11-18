import 'package:flutter/material.dart';

class EventFilters {
  String selectedCategory = 'すべて';
  String selectedProgress = 'すべて';
  DateTime? startDate;
  DateTime? endDate;
  bool hasParticipatingShops = false;
  bool todayOnly = false;
  bool thisWeekOnly = false;
  bool thisMonthOnly = false;

  EventFilters();

  EventFilters copyWith({
    String? selectedCategory,
    String? selectedProgress,
    DateTime? startDate,
    DateTime? endDate,
    bool? hasParticipatingShops,
    bool? todayOnly,
    bool? thisWeekOnly,
    bool? thisMonthOnly,
  }) {
    return EventFilters()
      ..selectedCategory = selectedCategory ?? this.selectedCategory
      ..selectedProgress = selectedProgress ?? this.selectedProgress
      ..startDate = startDate ?? this.startDate
      ..endDate = endDate ?? this.endDate
      ..hasParticipatingShops = hasParticipatingShops ?? this.hasParticipatingShops
      ..todayOnly = todayOnly ?? this.todayOnly
      ..thisWeekOnly = thisWeekOnly ?? this.thisWeekOnly
      ..thisMonthOnly = thisMonthOnly ?? this.thisMonthOnly;
  }

  bool get hasActiveFilters {
    return selectedCategory != 'すべて' ||
        selectedProgress != 'すべて' ||
        startDate != null ||
        endDate != null ||
        hasParticipatingShops ||
        todayOnly ||
        thisWeekOnly ||
        thisMonthOnly;
  }
  
  int get activeFilterCount {
    int count = 0;
    if (selectedCategory != 'すべて') count++;
    if (selectedProgress != 'すべて') count++;
    if (startDate != null || endDate != null || todayOnly || thisWeekOnly || thisMonthOnly) count++;
    if (hasParticipatingShops) count++;
    return count;
  }

  void reset() {
    selectedCategory = 'すべて';
    selectedProgress = 'すべて';
    startDate = null;
    endDate = null;
    hasParticipatingShops = false;
    todayOnly = false;
    thisWeekOnly = false;
    thisMonthOnly = false;
  }
}

class EventFilterSheet extends StatefulWidget {
  final EventFilters initialFilters;
  final Function(EventFilters) onApply;

  const EventFilterSheet({
    super.key,
    required this.initialFilters,
    required this.onApply,
  });

  @override
  State<EventFilterSheet> createState() => _EventFilterSheetState();
}

class _EventFilterSheetState extends State<EventFilterSheet> {
  late EventFilters _filters;

  final List<String> _categories = [
    'すべて',
    '祭り・イベント',
    'ワークショップ',
    '展示・ギャラリー',
    'マーケット・市場',
    '公演・パフォーマンス',
    'グルメ・料理',
    '伝統工芸',
    '自然・アウトドア',
    '教育・学習',
    'その他',
  ];

  final List<String> _progressStatuses = [
    'すべて',
    '開催予定',
    '開催中',
    '終了',
    '中止',
  ];

  @override
  void initState() {
    super.initState();
    _filters = widget.initialFilters.copyWith();
  }

  Future<void> _selectDate(bool isStartDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStartDate 
          ? (_filters.startDate ?? DateTime.now())
          : (_filters.endDate ?? DateTime.now()),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      locale: const Locale('ja', 'JP'),
    );
    
    if (picked != null) {
      setState(() {
        if (isStartDate) {
          _filters.startDate = picked;
          // 開始日が終了日より後の場合、終了日をリセット
          if (_filters.endDate != null && picked.isAfter(_filters.endDate!)) {
            _filters.endDate = null;
          }
        } else {
          _filters.endDate = picked;
        }
      });
    }
  }

  void _clearDateRange() {
    setState(() {
      _filters.startDate = null;
      _filters.endDate = null;
      _filters.todayOnly = false;
      _filters.thisWeekOnly = false;
      _filters.thisMonthOnly = false;
    });
  }

  void _setQuickDateFilter(String type) {
    setState(() {
      _clearDateRange();
      switch (type) {
        case 'today':
          _filters.todayOnly = true;
          break;
        case 'week':
          _filters.thisWeekOnly = true;
          break;
        case 'month':
          _filters.thisMonthOnly = true;
          break;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final activeFilterCount = [
      _filters.selectedCategory != 'すべて' ? 1 : 0,
      _filters.selectedProgress != 'すべて' ? 1 : 0,
      _filters.startDate != null || _filters.endDate != null ? 1 : 0,
      _filters.todayOnly || _filters.thisWeekOnly || _filters.thisMonthOnly ? 1 : 0,
      _filters.hasParticipatingShops ? 1 : 0,
    ].reduce((a, b) => a + b);

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
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
                // カテゴリー
                _buildSectionTitle('カテゴリー'),
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
                      selectedColor: Colors.green.shade100,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.green.shade700 : Colors.grey.shade700,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 24),

                // 進行状況
                _buildSectionTitle('進行状況'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _progressStatuses.map((status) {
                    final isSelected = _filters.selectedProgress == status;
                    return ChoiceChip(
                      label: Text(status),
                      selected: isSelected,
                      onSelected: (selected) {
                        setState(() {
                          _filters.selectedProgress = status;
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

                const SizedBox(height: 24),

                // 日付範囲
                _buildSectionTitle('開催期間'),
                const SizedBox(height: 8),
                
                // クイック選択
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ChoiceChip(
                      label: const Text('今日'),
                      selected: _filters.todayOnly,
                      onSelected: (selected) {
                        if (selected) _setQuickDateFilter('today');
                      },
                      selectedColor: Colors.orange.shade100,
                    ),
                    ChoiceChip(
                      label: const Text('今週'),
                      selected: _filters.thisWeekOnly,
                      onSelected: (selected) {
                        if (selected) _setQuickDateFilter('week');
                      },
                      selectedColor: Colors.orange.shade100,
                    ),
                    ChoiceChip(
                      label: const Text('今月'),
                      selected: _filters.thisMonthOnly,
                      onSelected: (selected) {
                        if (selected) _setQuickDateFilter('month');
                      },
                      selectedColor: Colors.orange.shade100,
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // カスタム日付範囲
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => _selectDate(true),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _filters.startDate != null
                                    ? '${_filters.startDate!.year}/${_filters.startDate!.month}/${_filters.startDate!.day}'
                                    : '開始日',
                                style: TextStyle(
                                  color: _filters.startDate != null
                                      ? Colors.black
                                      : Colors.grey.shade600,
                                ),
                              ),
                              Icon(Icons.calendar_today, size: 20, color: Colors.grey.shade600),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 8),
                      child: Text('〜'),
                    ),
                    Expanded(
                      child: InkWell(
                        onTap: () => _selectDate(false),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _filters.endDate != null
                                    ? '${_filters.endDate!.year}/${_filters.endDate!.month}/${_filters.endDate!.day}'
                                    : '終了日',
                                style: TextStyle(
                                  color: _filters.endDate != null
                                      ? Colors.black
                                      : Colors.grey.shade600,
                                ),
                              ),
                              Icon(Icons.calendar_today, size: 20, color: Colors.grey.shade600),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                
                if (_filters.startDate != null || _filters.endDate != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: TextButton(
                      onPressed: _clearDateRange,
                      child: const Text('日付をクリア'),
                    ),
                  ),

                const SizedBox(height: 24),

                // その他のフィルター
                _buildSectionTitle('その他'),
                const SizedBox(height: 8),
                SwitchListTile(
                  title: const Text('参加店舗があるイベントのみ'),
                  subtitle: const Text('複数店舗が参加するイベントを表示'),
                  value: _filters.hasParticipatingShops,
                  onChanged: (value) {
                    setState(() {
                      _filters.hasParticipatingShops = value;
                    });
                  },
                  activeColor: Colors.green,
                  contentPadding: EdgeInsets.zero,
                ),
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
                backgroundColor: Colors.green,
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