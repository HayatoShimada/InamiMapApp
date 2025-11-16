import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

class LocationProvider with ChangeNotifier {
  Position? _currentPosition;
  bool _isLoading = false;
  String? _error;
  bool _serviceEnabled = false;
  LocationPermission _permission = LocationPermission.denied;

  Position? get currentPosition => _currentPosition;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get serviceEnabled => _serviceEnabled;
  LocationPermission get permission => _permission;

  Future<bool> checkPermissions() async {
    // Check if location services are enabled
    _serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!_serviceEnabled) {
      _error = 'Location services are disabled.';
      notifyListeners();
      return false;
    }

    // Check location permissions
    _permission = await Geolocator.checkPermission();
    if (_permission == LocationPermission.denied) {
      _permission = await Geolocator.requestPermission();
      if (_permission == LocationPermission.denied) {
        _error = 'Location permissions are denied';
        notifyListeners();
        return false;
      }
    }

    if (_permission == LocationPermission.deniedForever) {
      _error = 'Location permissions are permanently denied, we cannot request permissions.';
      notifyListeners();
      return false;
    }

    _error = null;
    notifyListeners();
    return true;
  }

  Future<void> getCurrentLocation() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Check permissions first
      final hasPermission = await checkPermissions();
      if (!hasPermission) {
        _isLoading = false;
        notifyListeners();
        return;
      }

      // Get current position
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      debugPrint('Current location: ${_currentPosition?.latitude}, ${_currentPosition?.longitude}');
    } catch (e) {
      _error = 'Failed to get current location: $e';
      debugPrint('Location error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> openLocationSettings() async {
    await Geolocator.openLocationSettings();
  }

  Future<void> openAppSettings() async {
    await Geolocator.openAppSettings();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  double? distanceTo(double latitude, double longitude) {
    if (_currentPosition == null) return null;
    
    return Geolocator.distanceBetween(
      _currentPosition!.latitude,
      _currentPosition!.longitude,
      latitude,
      longitude,
    );
  }

  String formatDistance(double? distanceInMeters) {
    if (distanceInMeters == null) return 'Distance unknown';
    
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.round()} m';
    } else {
      final km = distanceInMeters / 1000;
      return '${km.toStringAsFixed(1)} km';
    }
  }
}