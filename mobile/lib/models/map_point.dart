class MapPoint {
  final String id;
  final String name;
  final String description;
  final double latitude;
  final double longitude;
  final String? category;
  final String? imageUrl;

  MapPoint({
    required this.id,
    required this.name,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.category,
    this.imageUrl,
  });

  factory MapPoint.fromJson(Map<String, dynamic> json) {
    return MapPoint(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      category: json['category'] as String?,
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'category': category,
      'imageUrl': imageUrl,
    };
  }

  @override
  String toString() {
    return 'MapPoint(id: $id, name: $name, lat: $latitude, lng: $longitude)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is MapPoint && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}