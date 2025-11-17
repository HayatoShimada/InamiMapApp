import 'package:flutter/material.dart';
import '../utils/service_icons.dart';

class ShopServicesWidget extends StatelessWidget {
  final List<String>? services;
  final bool showTitle;
  final int? maxVisible;

  const ShopServicesWidget({
    super.key,
    this.services,
    this.showTitle = true,
    this.maxVisible,
  });

  @override
  Widget build(BuildContext context) {
    if (services == null || services!.isEmpty) {
      return const SizedBox.shrink();
    }

    final displayServices = maxVisible != null && services!.length > maxVisible!
        ? services!.take(maxVisible!).toList()
        : services!;

    final hasMoreServices = maxVisible != null && services!.length > maxVisible!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showTitle) ...[
          Row(
            children: [
              const Icon(
                Icons.miscellaneous_services,
                size: 18,
                color: Colors.blue,
              ),
              const SizedBox(width: 4),
              Text(
                '提供サービス',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '(${services!.length})',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
        Wrap(
          spacing: 6,
          runSpacing: 4,
          children: [
            ...displayServices.map((service) => ServiceChip(service: service)),
            if (hasMoreServices)
              Chip(
                label: Text(
                  '+${services!.length - maxVisible!}',
                  style: const TextStyle(fontSize: 11),
                ),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                visualDensity: VisualDensity.compact,
                backgroundColor: Colors.grey[200],
              ),
          ],
        ),
      ],
    );
  }
}

class ServiceChip extends StatelessWidget {
  final String service;

  const ServiceChip({
    super.key,
    required this.service,
  });

  @override
  Widget build(BuildContext context) {
    final icon = ServiceIcons.getIcon(service);
    
    return Chip(
      avatar: Text(
        icon,
        style: const TextStyle(fontSize: 12),
      ),
      label: Text(
        service,
        style: const TextStyle(fontSize: 10),
      ),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: VisualDensity.compact,
      backgroundColor: Colors.blue[50],
      side: BorderSide(color: Colors.blue[300]!),
    );
  }
}

// 使用例:
// ShopServicesWidget(services: shop.services)
// ShopServicesWidget(services: shop.services, maxVisible: 4) // 最大4個まで表示