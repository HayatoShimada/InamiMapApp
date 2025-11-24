import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/favorite_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('プロフィール'),
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          
          if (user == null) {
            return const Center(
              child: Text('ユーザー情報が取得できません'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // ユーザー情報カード
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        // プロフィール画像
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: Colors.grey.shade200,
                          backgroundImage: user.photoURL != null
                              ? NetworkImage(user.photoURL!)
                              : null,
                          child: user.photoURL == null
                              ? const Icon(
                                  Icons.person,
                                  size: 50,
                                  color: Colors.grey,
                                )
                              : null,
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // 表示名
                        Text(
                          user.displayName ?? 'ユーザー',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        // メールアドレス
                        Text(
                          user.email,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // 最終ログイン
                        if (user.lastLogin != null) ...[
                          Text(
                            '最終ログイン: ${_formatDateTime(user.lastLogin!)}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // お気に入り統計
                Consumer<FavoriteProvider>(
                  builder: (context, favoriteProvider, child) {
                    final stats = favoriteProvider.stats;
                    
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'お気に入り統計',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            
                            const SizedBox(height: 16),
                            
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                _buildStatItem(
                                  icon: Icons.store,
                                  label: '店舗',
                                  count: stats['shops'] ?? 0,
                                  color: Colors.blue,
                                ),
                                _buildStatItem(
                                  icon: Icons.event,
                                  label: 'イベント',
                                  count: stats['events'] ?? 0,
                                  color: Colors.green,
                                ),
                                _buildStatItem(
                                  icon: Icons.favorite,
                                  label: '合計',
                                  count: stats['total'] ?? 0,
                                  color: Colors.red,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                
                const SizedBox(height: 20),
                
                // アクションボタン
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.refresh, color: Colors.blue),
                        title: const Text('お気に入りを更新'),
                        subtitle: const Text('最新のお気に入り情報を取得します'),
                        onTap: () {
                          context.read<FavoriteProvider>().refresh();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('お気に入り情報を更新しました'),
                            ),
                          );
                        },
                      ),
                      
                      const Divider(),
                      
                      ListTile(
                        leading: const Icon(Icons.info_outline, color: Colors.grey),
                        title: const Text('アプリについて'),
                        subtitle: const Text('バージョン情報・利用規約'),
                        onTap: () => _showAboutDialog(context),
                      ),
                      
                      const Divider(),
                      
                      ListTile(
                        leading: const Icon(Icons.privacy_tip_outlined, color: Colors.grey),
                        title: const Text('プライバシーポリシー'),
                        subtitle: const Text('個人情報の取り扱いについて'),
                        onTap: () => _showPrivacyPolicy(context),
                      ),
                      
                      const Divider(),
                      
                      ListTile(
                        leading: const Icon(Icons.description_outlined, color: Colors.grey),
                        title: const Text('利用規約'),
                        subtitle: const Text('アプリの利用規約を確認'),
                        onTap: () => _showTermsOfService(context),
                      ),
                      
                      const Divider(),
                      
                      ListTile(
                        leading: const Icon(Icons.contact_support_outlined, color: Colors.grey),
                        title: const Text('お問い合わせ'),
                        subtitle: const Text('85-Store'),
                        onTap: () => _showContact(context),
                      ),
                      
                      const Divider(),
                      
                      ListTile(
                        leading: const Icon(Icons.logout, color: Colors.orange),
                        title: const Text('ログアウト'),
                        subtitle: const Text('アプリからログアウトします'),
                        onTap: () => _showLogoutDialog(context),
                      ),
                      
                      const Divider(),
                      
                      ListTile(
                        leading: const Icon(Icons.delete_forever, color: Colors.red),
                        title: const Text('アカウント削除'),
                        subtitle: const Text('すべてのデータが削除されます'),
                        onTap: () => _showDeleteAccountDialog(context),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required int count,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: color,
            size: 24,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '$count',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.year}/${dateTime.month}/${dateTime.day} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('井波マップアプリについて'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('バージョン: 1.0.0'),
            SizedBox(height: 8),
            Text('井波町の店舗やイベント情報を探索できるアプリです。'),
            SizedBox(height: 8),
            Text('お気に入り機能を使って、興味のある情報を保存しましょう。'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('閉じる'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ログアウト'),
        content: const Text('ログアウトしますか？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await context.read<AuthProvider>().signOut();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
            child: const Text(
              'ログアウト',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('アカウント削除'),
        content: const Text(
          'アカウントを削除すると、すべてのお気に入りデータが失われます。\n\nこの操作は取り消せません。本当に削除しますか？',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('最終確認'),
                  content: const Text('本当にアカウントを削除しますか？'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('キャンセル'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text(
                        '削除する',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              );

              if (confirmed == true && context.mounted) {
                final success = await context.read<AuthProvider>().deleteAccount();
                if (success && context.mounted) {
                  Navigator.of(context).pushReplacementNamed('/login');
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('アカウントが削除されました'),
                    ),
                  );
                }
              }
            },
            child: const Text(
              '削除',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  void _showPrivacyPolicy(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('プライバシーポリシー'),
        content: const SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '1. 個人情報の収集',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('本アプリでは、以下の情報を収集します：'),
              Text('・Googleアカウント情報（名前、メールアドレス、プロフィール画像）'),
              Text('・位置情報（お客様の同意がある場合のみ）'),
              Text('・お気に入り登録情報'),
              SizedBox(height: 16),
              
              Text(
                '2. 情報の利用目的',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('収集した情報は以下の目的で利用します：'),
              Text('・アプリの機能提供'),
              Text('・ユーザー体験の向上'),
              Text('・統計情報の作成（個人を特定しない形で）'),
              SizedBox(height: 16),
              
              Text(
                '3. 情報の第三者提供',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('お客様の個人情報は、法令に基づく場合を除き、第三者に提供することはありません。'),
              SizedBox(height: 16),
              
              Text(
                '4. データの保存期間',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('アカウントを削除するまで保存されます。アカウント削除時にすべてのデータが削除されます。'),
              SizedBox(height: 16),
              
              Text(
                '5. お問い合わせ',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('個人情報の取り扱いに関するお問い合わせ：'),
              Text('85-Store'),
              Text('Email: info@85-store.com'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('閉じる'),
          ),
        ],
      ),
    );
  }

  void _showTermsOfService(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('利用規約'),
        content: const SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '第1条（本規約の適用）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('この利用規約（以下「本規約」）は、85-Store（以下「運営者」）が提供する井波マップアプリ（以下「本アプリ」）の利用条件を定めるものです。'),
              SizedBox(height: 16),
              
              Text(
                '第2条（利用登録）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('本アプリの利用にはGoogleアカウントによる認証が必要です。利用者は正確な情報を提供するものとします。'),
              SizedBox(height: 16),
              
              Text(
                '第3条（個人情報の取扱い）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('運営者は、利用者の個人情報を別途定めるプライバシーポリシーに従い適切に取り扱います。'),
              SizedBox(height: 16),
              
              Text(
                '第4条（禁止事項）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('利用者は以下の行為をしてはなりません：'),
              Text('・法令または公序良俗に違反する行為'),
              Text('・犯罪行為に関連する行為'),
              Text('・運営者または第三者の知的財産権を侵害する行為'),
              Text('・本アプリの運営を妨害する行為'),
              Text('・不正アクセスまたはこれを試みる行為'),
              Text('・その他、運営者が不適切と判断する行為'),
              SizedBox(height: 16),
              
              Text(
                '第5条（本アプリの提供の停止等）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('運営者は、以下の場合には事前の通知なく本アプリの全部または一部の提供を停止・中断できるものとします：'),
              Text('・本アプリのシステムの保守・更新を行う場合'),
              Text('・地震、落雷、火災等の不可抗力により提供が困難な場合'),
              Text('・その他、運営者が停止・中断を必要と判断した場合'),
              SizedBox(height: 16),
              
              Text(
                '第6条（免責事項）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('運営者は、本アプリに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを保証するものではありません。'),
              SizedBox(height: 16),
              
              Text(
                '第7条（利用規約の変更）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('運営者は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。変更後の本規約は、本アプリ内に掲載したときから効力を生じるものとします。'),
              SizedBox(height: 16),
              
              Text(
                '第8条（準拠法・裁判管轄）',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('本規約の解釈にあたっては、日本法を準拠法とします。本アプリに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。'),
              SizedBox(height: 16),
              
              Text('制定日: 2025年11月18日'),
              Text('運営者: 85-Store'),
              Text('連絡先: info@85-store.com'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('閉じる'),
          ),
        ],
      ),
    );
  }

  void _showContact(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('お問い合わせ'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '運営: 85-Store',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            
            Row(
              children: [
                Icon(Icons.email, size: 20, color: Colors.grey),
                SizedBox(width: 8),
                Text('info@85-store.com'),
              ],
            ),
            SizedBox(height: 16),
            
            Text(
              'アプリに関するご意見・ご要望、不具合のご報告などお気軽にお問い合わせください。',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('閉じる'),
          ),
        ],
      ),
    );
  }
}