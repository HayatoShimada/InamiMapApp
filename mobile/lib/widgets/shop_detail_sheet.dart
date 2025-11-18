import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../models/shop_model.dart';
import 'favorite_button.dart';
import 'temporary_status_widget.dart';
import 'shop_services_widget.dart';

class ShopDetailSheet extends StatelessWidget {
  final ShopModel shop;
  final VoidCallback? onShowMap;

  const ShopDetailSheet({
    super.key,
    required this.shop,
    this.onShowMap,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // ハンドル
              Container(
                margin: const EdgeInsets.only(top: 8),
                height: 4,
                width: 40,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // 店舗名とお気に入りボタン
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            shop.shopName,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        FavoriteButton(
                          itemType: 'shop',
                          itemId: shop.id,
                          size: 32,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 8),
                    
                    // カテゴリー
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade100,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        shop.shopCategory,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.blue.shade700,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // 店舗画像
                    if (shop.images.isNotEmpty) ...[
                      SizedBox(
                        height: 200,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: shop.images.length,
                          itemBuilder: (context, index) {
                            return Container(
                              margin: const EdgeInsets.only(right: 8),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: CachedNetworkImage(
                                  imageUrl: shop.images[index],
                                  width: 160,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    width: 160,
                                    color: Colors.grey.shade200,
                                    child: const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => Container(
                                    width: 160,
                                    color: Colors.grey.shade200,
                                    child: const Icon(Icons.error),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    
                    // 臨時営業ステータス
                    TemporaryStatusWidget(
                      temporaryStatus: shop.temporaryStatus,
                    ),
                    
                    // 説明
                    const Text(
                      '店舗説明',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      shop.description,
                      style: const TextStyle(
                        fontSize: 16,
                        height: 1.5,
                      ),
                    ),
                    
                    // こだわりポイント
                    if (shop.maniacPoint.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'こだわりポイント',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.orange.shade200),
                        ),
                        child: Text(
                          shop.maniacPoint,
                          style: const TextStyle(
                            fontSize: 16,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                    
                    // 提供サービス
                    const SizedBox(height: 16),
                    ShopServicesWidget(
                      services: shop.services,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // 連絡先情報
                    if (shop.phone != null || shop.email != null || shop.closedDays != null) ...[
                      const Text(
                        '連絡先・営業情報',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      
                      if (shop.phone != null) ...[
                        Row(
                          children: [
                            const Icon(Icons.phone, color: Colors.green, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              shop.phone!,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                      ],
                      
                      if (shop.email != null) ...[
                        Row(
                          children: [
                            const Icon(Icons.email, color: Colors.blue, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                shop.email!,
                                style: const TextStyle(fontSize: 16),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                      ],
                      
                      if (shop.closedDays != null) ...[
                        Row(
                          children: [
                            const Icon(Icons.schedule, color: Colors.orange, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                shop.closedDays!,
                                style: const TextStyle(fontSize: 16),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                      ],
                      
                      const SizedBox(height: 16),
                    ],
                    
                    // 住所
                    const Text(
                      '住所',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            shop.address,
                            style: const TextStyle(fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                    
                    // 座標表示
                    if (shop.location != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.gps_fixed, color: Colors.blue, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '緯度: ${shop.location!.latitude}\n経度: ${shop.location!.longitude}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade700,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    
                    const SizedBox(height: 16),
                    
                    // SNSリンク
                    if (shop.socialMedia != null && shop.socialMedia!.isNotEmpty) ...[
                      const Text(
                        'SNS',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildSocialMediaLinks(),
                      const SizedBox(height: 20),
                    ],
                    
                    // ボタンセクション
                    // 地図で表示ボタン（onShowMapが指定されている場合のみ表示）
                    if (onShowMap != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: onShowMap,
                          icon: const Icon(Icons.map),
                          label: const Text('地図で表示'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    
                    // Googleマップで開く
                    if (shop.googleMapUrl != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _launchUrl(shop.googleMapUrl!),
                          icon: const Icon(Icons.map),
                          label: const Text('Googleマップで開く'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    
                    // ウェブサイト
                    if (shop.website != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () => _launchUrl(shop.website!),
                          icon: const Icon(Icons.web),
                          label: const Text('ウェブサイト'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    
                    // オンラインストア
                    if (shop.onlineStore != null) ...[
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () => _launchUrl(shop.onlineStore!),
                          icon: const Icon(Icons.shopping_cart),
                          label: const Text('オンラインストア'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                    
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSocialMediaLinks() {
    final socialMedia = shop.socialMedia!;
    final List<Widget> socialLinks = [];
    
    // Instagram
    if (socialMedia['instagram'] != null && socialMedia['instagram']!.isNotEmpty) {
      socialLinks.add(_buildSocialIcon(
        icon: FontAwesomeIcons.instagram,
        color: const Color(0xFFE1306C),
        url: _formatSocialUrl('instagram', socialMedia['instagram']!),
        tooltip: 'Instagram',
      ));
    }
    
    // Twitter/X
    if (socialMedia['twitter'] != null && socialMedia['twitter']!.isNotEmpty) {
      socialLinks.add(_buildSocialIcon(
        icon: FontAwesomeIcons.xTwitter,
        color: Colors.black,
        url: _formatSocialUrl('twitter', socialMedia['twitter']!),
        tooltip: 'X (旧Twitter)',
      ));
    }
    
    // Facebook
    if (socialMedia['facebook'] != null && socialMedia['facebook']!.isNotEmpty) {
      socialLinks.add(_buildSocialIcon(
        icon: FontAwesomeIcons.facebook,
        color: const Color(0xFF1877F2),
        url: _formatSocialUrl('facebook', socialMedia['facebook']!),
        tooltip: 'Facebook',
      ));
    }
    
    // YouTube
    if (socialMedia['youtube'] != null && socialMedia['youtube']!.isNotEmpty) {
      socialLinks.add(_buildSocialIcon(
        icon: FontAwesomeIcons.youtube,
        color: const Color(0xFFFF0000),
        url: _formatSocialUrl('youtube', socialMedia['youtube']!),
        tooltip: 'YouTube',
      ));
    }
    
    // LINE
    if (socialMedia['line'] != null && socialMedia['line']!.isNotEmpty) {
      socialLinks.add(_buildSocialIcon(
        icon: FontAwesomeIcons.line,
        color: const Color(0xFF00B900),
        url: _formatSocialUrl('line', socialMedia['line']!),
        tooltip: 'LINE',
      ));
    }
    
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: socialLinks,
    );
  }
  
  Widget _buildSocialIcon({
    required IconData icon,
    required Color color,
    required String url,
    required String tooltip,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: () => _launchUrl(url),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: color.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: FaIcon(
            icon,
            color: color,
            size: 24,
          ),
        ),
      ),
    );
  }
  
  String _formatSocialUrl(String platform, String value) {
    // URLが既に含まれている場合はそのまま返す
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // @マークを削除（あれば）
    String username = value.startsWith('@') ? value.substring(1) : value;
    
    // プラットフォームごとのURLを生成
    switch (platform) {
      case 'instagram':
        return 'https://www.instagram.com/$username';
      case 'twitter':
        return 'https://x.com/$username';
      case 'facebook':
        return value; // FacebookはURLをそのまま使用
      case 'youtube':
        return value; // YouTubeはURLをそのまま使用
      case 'line':
        return value; // LINEはURLまたはIDをそのまま使用
      default:
        return value;
    }
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      print('Could not launch $urlString');
    }
  }
}