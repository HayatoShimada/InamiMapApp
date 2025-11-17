// 提供サービスのアイコンマッピング
class ServiceIcons {
  static const Map<String, String> icons = {
    'トイレ利用可能': '🚻',
    'モバイル充電可能': '🔌',
    'ペット同伴可': '🐕',
    '喫煙所あり': '🚬',
    'おむつ交換台': '👶',
    'Wi-Fi利用可能': '📶',
    'クレジットカード対応': '💳',
    '電子マネー対応': '📱',
    'バリアフリー対応': '♿',
    '駐車場あり': '🅿️',
    '自転車置き場': '🚲',
    'テイクアウト可能': '🥡',
    '配達・デリバリー': '🚚',
    '予約可能': '📅',
    'オンライン注文': '🛒',
    '多言語対応': '🌐',
    'その他': '⭐',
  };

  static String getIcon(String service) {
    return icons[service] ?? '⭐';
  }

  static List<String> get allServices => icons.keys.toList();
}