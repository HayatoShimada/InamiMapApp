import 'package:flutter/material.dart';
import '../models/shop_model.dart';

class TemporaryStatusWidget extends StatelessWidget {
  final TemporaryStatus? temporaryStatus;
  final bool showIcon;

  const TemporaryStatusWidget({
    super.key,
    this.temporaryStatus,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    if (temporaryStatus == null || !temporaryStatus!.isActiveToday) {
      return const SizedBox.shrink();
    }

    final isTemporaryClosed = temporaryStatus!.isTemporaryClosed;
    final isReducedHours = temporaryStatus!.isReducedHours;
    final message = temporaryStatus!.message;

    String statusText;
    Color statusColor;
    IconData statusIcon;

    if (isTemporaryClosed) {
      statusText = '臨時休業中';
      statusColor = Colors.red;
      statusIcon = Icons.store_mall_directory_outlined;
    } else if (isReducedHours) {
      statusText = '時短営業中';
      statusColor = Colors.orange;
      statusIcon = Icons.schedule;
    } else {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        border: Border.all(color: statusColor.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (showIcon) ...[
                Icon(
                  statusIcon,
                  size: 16,
                  color: statusColor,
                ),
                const SizedBox(width: 6),
              ],
              Text(
                statusText,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: statusColor,
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              if (temporaryStatus!.startDate != null && temporaryStatus!.endDate != null)
                Text(
                  '${_formatDate(temporaryStatus!.startDate!)} - ${_formatDate(temporaryStatus!.endDate!)}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[600],
                  ),
                ),
            ],
          ),
          if (message != null && message!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              message!,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[700],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.month}/${date.day}';
  }
}

// 使用例:
// TemporaryStatusWidget(temporaryStatus: shop.temporaryStatus)