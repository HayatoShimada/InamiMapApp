import 'package:flutter/material.dart';
import '../models/shop_model.dart';
import '../models/event_model.dart';

class NavigationProvider extends ChangeNotifier {
  int _selectedIndex = 0;
  ShopModel? _focusShop;
  EventModel? _focusEvent;
  
  int get selectedIndex => _selectedIndex;
  ShopModel? get focusShop => _focusShop;
  EventModel? get focusEvent => _focusEvent;
  
  void switchToTab(int index, {ShopModel? focusShop, EventModel? focusEvent}) {
    print('NavigationProvider.switchToTab: index=$index, focusShop=${focusShop?.shopName}, focusEvent=${focusEvent?.eventName}');
    _selectedIndex = index;
    _focusShop = focusShop;
    _focusEvent = focusEvent;
    notifyListeners();
  }
  
  void clearFocus() {
    _focusShop = null;
    _focusEvent = null;
    notifyListeners();
  }
}