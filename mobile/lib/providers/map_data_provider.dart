import 'package:flutter/foundation.dart';
import '../models/map_point.dart';
import '../services/api_service.dart';

class MapDataProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<MapPoint> _mapPoints = [];
  bool _isLoading = false;
  String? _error;

  List<MapPoint> get mapPoints => _mapPoints;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadMapPoints() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Try to load from API first
      final points = await _apiService.getMapPoints();
      _mapPoints = points;
    } catch (e) {
      // Fallback to mock data if API fails
      debugPrint('API failed, using mock data: $e');
      _mapPoints = _getMockMapPoints();
      _error = null; // Don't show error for mock data
    }

    _isLoading = false;
    notifyListeners();
  }

  List<MapPoint> _getMockMapPoints() {
    return [
      MapPoint(
        id: '1',
        name: 'Inami Woodcarving Center',
        description: 'Famous woodcarving workshop and gallery showcasing traditional crafts',
        latitude: 36.5569,
        longitude: 136.9628,
        category: 'Culture',
      ),
      MapPoint(
        id: '2',
        name: 'Zuisenji Temple',
        description: 'Historic temple known for its beautiful woodcarvings',
        latitude: 36.5580,
        longitude: 136.9640,
        category: 'Temple',
      ),
      MapPoint(
        id: '3',
        name: 'Inami Traditional Craft Village',
        description: 'Experience traditional Japanese crafts and culture',
        latitude: 36.5550,
        longitude: 136.9610,
        category: 'Culture',
      ),
      MapPoint(
        id: '4',
        name: 'Inami Park',
        description: 'Beautiful park perfect for walks and relaxation',
        latitude: 36.5590,
        longitude: 136.9650,
        category: 'Park',
      ),
      MapPoint(
        id: '5',
        name: 'Local Sake Brewery',
        description: 'Traditional sake brewing with tasting opportunities',
        latitude: 36.5540,
        longitude: 136.9600,
        category: 'Food & Drink',
      ),
    ];
  }

  Future<void> refreshMapPoints() async {
    await loadMapPoints();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}