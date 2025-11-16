import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../providers/map_data_provider.dart';
import '../models/map_point.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  
  // Inami, Toyama Prefecture coordinates
  static const LatLng _inamiCenter = LatLng(36.5569, 136.9628);

  @override
  void initState() {
    super.initState();
    // Load map data when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MapDataProvider>().loadMapPoints();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inami Map'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _centerOnInami,
            tooltip: 'Center on Inami',
          ),
        ],
      ),
      body: Consumer<MapDataProvider>(
        builder: (context, mapDataProvider, child) {
          return Column(
            children: [
              Expanded(
                flex: 3,
                child: FlutterMap(
                  mapController: _mapController,
                  options: const MapOptions(
                    initialCenter: _inamiCenter,
                    initialZoom: 15.0,
                    minZoom: 10.0,
                    maxZoom: 18.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.inamimapapp.inami_map_app',
                    ),
                    MarkerLayer(
                      markers: _buildMarkers(mapDataProvider.mapPoints),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 1,
                child: _buildPointsList(mapDataProvider.mapPoints),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<MapDataProvider>().loadMapPoints();
        },
        tooltip: 'Refresh',
        child: const Icon(Icons.refresh),
      ),
    );
  }

  List<Marker> _buildMarkers(List<MapPoint> points) {
    return points.map((point) {
      return Marker(
        point: LatLng(point.latitude, point.longitude),
        width: 40,
        height: 40,
        child: GestureDetector(
          onTap: () => _showPointDetails(point),
          child: const Icon(
            Icons.location_pin,
            color: Colors.red,
            size: 40,
          ),
        ),
      );
    }).toList();
  }

  Widget _buildPointsList(List<MapPoint> points) {
    if (points.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.location_off, size: 48, color: Colors.grey),
            SizedBox(height: 16),
            Text('No points of interest loaded'),
            Text('Tap refresh to load data'),
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
            color: Colors.black.withOpacity(0.1),
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
              'Points of Interest (${points.length})',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: points.length,
              itemBuilder: (context, index) {
                final point = points[index];
                return ListTile(
                  leading: const Icon(Icons.place, color: Colors.red),
                  title: Text(point.name),
                  subtitle: Text(
                    point.description,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  onTap: () => _centerOnPoint(point),
                  trailing: IconButton(
                    icon: const Icon(Icons.info_outline),
                    onPressed: () => _showPointDetails(point),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _centerOnInami() {
    _mapController.move(_inamiCenter, 15.0);
  }

  void _centerOnPoint(MapPoint point) {
    _mapController.move(LatLng(point.latitude, point.longitude), 17.0);
  }

  void _showPointDetails(MapPoint point) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.4,
        maxChildSize: 0.8,
        minChildSize: 0.3,
        expand: false,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.place, color: Colors.red, size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      point.name,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                point.description,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _centerOnPoint(point);
                      },
                      icon: const Icon(Icons.center_focus_strong),
                      label: const Text('Center on Map'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        // TODO: Implement navigation
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Navigation coming soon!')),
                        );
                      },
                      icon: const Icon(Icons.navigation),
                      label: const Text('Navigate'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}