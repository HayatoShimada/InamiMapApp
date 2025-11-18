/// Utility functions for formatting geographic coordinates with consistent precision
class CoordinateUtils {
  /// Maximum precision for coordinates (matches web version)
  static const int maxPrecision = 20;
  
  /// Display precision for UI (fewer decimal places for readability)
  static const int displayPrecision = 6;
  
  /// Formats a coordinate value to match web version's precision
  /// Preserves up to 20 decimal places but removes trailing zeros
  static String? formatCoordinateForStorage(double? value) {
    if (value == null) return null;
    
    // Format with maximum precision
    String formatted = value.toStringAsFixed(maxPrecision);
    
    // Remove trailing zeros after decimal point
    if (formatted.contains('.')) {
      formatted = formatted.replaceAll(RegExp(r'0+$'), '');
      // Remove decimal point if no decimals remain
      if (formatted.endsWith('.')) {
        formatted = formatted.substring(0, formatted.length - 1);
      }
    }
    
    return formatted;
  }
  
  /// Formats a coordinate value for display in the UI
  /// Uses fewer decimal places for better readability
  static String? formatCoordinateForDisplay(double? value) {
    if (value == null) return null;
    
    // Format with display precision
    String formatted = value.toStringAsFixed(displayPrecision);
    
    // Remove trailing zeros for cleaner display
    if (formatted.contains('.')) {
      formatted = formatted.replaceAll(RegExp(r'0+$'), '');
      if (formatted.endsWith('.')) {
        formatted = formatted.substring(0, formatted.length - 1);
      }
    }
    
    return formatted;
  }
  
  /// Formats latitude and longitude as a display-friendly string
  /// Example: "36.123456, 136.987654"
  static String? formatCoordinatePair(double? latitude, double? longitude) {
    if (latitude == null || longitude == null) return null;
    
    final lat = formatCoordinateForDisplay(latitude);
    final lng = formatCoordinateForDisplay(longitude);
    
    if (lat == null || lng == null) return null;
    
    return '$lat, $lng';
  }
  
  /// Formats latitude and longitude for storage with full precision
  static Map<String, String>? formatCoordinatesForStorage(
      double? latitude, double? longitude) {
    if (latitude == null || longitude == null) return null;
    
    final lat = formatCoordinateForStorage(latitude);
    final lng = formatCoordinateForStorage(longitude);
    
    if (lat == null || lng == null) return null;
    
    return {
      'latitude': lat,
      'longitude': lng,
    };
  }
  
  /// Parses a coordinate string to double, handling various formats
  static double? parseCoordinate(String? value) {
    if (value == null || value.isEmpty) return null;
    
    try {
      // Remove any whitespace
      final cleaned = value.trim();
      return double.parse(cleaned);
    } catch (e) {
      return null;
    }
  }
  
  /// Validates if a latitude value is within valid range
  static bool isValidLatitude(double? latitude) {
    if (latitude == null) return false;
    return latitude >= -90.0 && latitude <= 90.0;
  }
  
  /// Validates if a longitude value is within valid range
  static bool isValidLongitude(double? longitude) {
    if (longitude == null) return false;
    return longitude >= -180.0 && longitude <= 180.0;
  }
  
  /// Validates if both latitude and longitude are valid
  static bool areCoordinatesValid(double? latitude, double? longitude) {
    return isValidLatitude(latitude) && isValidLongitude(longitude);
  }
  
  /// Rounds a coordinate to a specific number of decimal places
  static double? roundCoordinate(double? value, int decimalPlaces) {
    if (value == null) return null;
    
    final multiplier = 10.0 * decimalPlaces;
    return (value * multiplier).round() / multiplier;
  }
  
  /// Creates a Google Maps URL from coordinates
  static String? createGoogleMapsUrl(double? latitude, double? longitude) {
    if (latitude == null || longitude == null) return null;
    
    final lat = formatCoordinateForStorage(latitude);
    final lng = formatCoordinateForStorage(longitude);
    
    if (lat == null || lng == null) return null;
    
    return 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
  }
  
  /// Extracts coordinates from a Google Maps URL
  /// Supports various Google Maps URL formats
  static Map<String, double>? extractCoordinatesFromUrl(String? url) {
    if (url == null || url.isEmpty) return null;
    
    // Pattern for coordinates in the format: @lat,lng,zoom (高精度対応)
    final atPattern = RegExp(r'@(-?\d+\.\d{1,20}),(-?\d+\.\d{1,20}),?\d*z?');
    final atMatch = atPattern.firstMatch(url);
    
    if (atMatch != null) {
      final lat = parseCoordinate(atMatch.group(1));
      final lng = parseCoordinate(atMatch.group(2));
      
      if (lat != null && lng != null && areCoordinatesValid(lat, lng)) {
        return {'latitude': lat, 'longitude': lng};
      }
    }
    
    // Pattern for coordinates in query parameter: query=lat,lng (高精度対応)
    final queryPattern = RegExp(r'query=(-?\d+\.\d{1,20})[,+](-?\d+\.\d{1,20})');
    final queryMatch = queryPattern.firstMatch(url);
    
    if (queryMatch != null) {
      final lat = parseCoordinate(queryMatch.group(1));
      final lng = parseCoordinate(queryMatch.group(2));
      
      if (lat != null && lng != null && areCoordinatesValid(lat, lng)) {
        return {'latitude': lat, 'longitude': lng};
      }
    }
    
    // Pattern for place coordinates: /place/.../@lat,lng (高精度対応)
    final placeAtPattern = RegExp(r'/place/[^/]+/@(-?\d+\.\d{1,20}),(-?\d+\.\d{1,20})');
    final placeAtMatch = placeAtPattern.firstMatch(url);
    
    if (placeAtMatch != null) {
      final lat = parseCoordinate(placeAtMatch.group(1));
      final lng = parseCoordinate(placeAtMatch.group(2));
      
      if (lat != null && lng != null && areCoordinatesValid(lat, lng)) {
        return {'latitude': lat, 'longitude': lng};
      }
    }
    
    // Pattern for place coordinates: place/data=...!3d{lat}!4d{lng} (高精度対応)
    final placeDataPattern = RegExp(r'!3d(-?\d+\.\d{1,20})!4d(-?\d+\.\d{1,20})');
    final placeDataMatch = placeDataPattern.firstMatch(url);
    
    if (placeDataMatch != null) {
      final lat = parseCoordinate(placeDataMatch.group(1));
      final lng = parseCoordinate(placeDataMatch.group(2));
      
      if (lat != null && lng != null && areCoordinatesValid(lat, lng)) {
        return {'latitude': lat, 'longitude': lng};
      }
    }
    
    return null;
  }
}