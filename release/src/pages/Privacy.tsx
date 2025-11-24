import { Box, Container, Typography, Paper, Divider } from '@mui/material'

export default function Privacy() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700}>
            プライバシーポリシー
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            とことこ井波マップにおける個人情報の取り扱いについて
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            最終更新日: 2025年11月24日
          </Typography>

          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            85-Store（以下「当社」）は、「とことこ井波マップ」（以下「本アプリ」）における
            ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第1条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第1条（収集する情報）
          </Typography>
          <Typography variant="body1" paragraph>
            本アプリでは、以下の情報を収集する場合があります。
          </Typography>
          <Typography variant="h6" component="h3" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            1. 一般ユーザー（アプリ利用者）
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              位置情報（ルート案内機能を使用する場合のみ、ユーザーの許可を得て取得）
            </Typography>
            <Typography component="li" variant="body1">
              お気に入り登録情報（端末内にローカル保存）
            </Typography>
            <Typography component="li" variant="body1">
              アプリの利用状況（匿名の統計データ）
            </Typography>
          </Box>
          <Typography variant="h6" component="h3" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            2. 店舗オーナー（管理画面利用者）
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              Googleアカウント情報（メールアドレス、表示名、プロフィール画像）
            </Typography>
            <Typography component="li" variant="body1">
              店舗情報（店舗名、住所、営業時間、連絡先、写真等）
            </Typography>
            <Typography component="li" variant="body1">
              イベント情報（イベント名、日時、場所、内容等）
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 第2条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第2条（情報の利用目的）
          </Typography>
          <Typography variant="body1" paragraph>
            収集した情報は、以下の目的で利用します。
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              本アプリのサービス提供および機能改善
            </Typography>
            <Typography component="li" variant="body1">
              店舗・イベント情報の表示および管理
            </Typography>
            <Typography component="li" variant="body1">
              ユーザーへのルート案内サービスの提供
            </Typography>
            <Typography component="li" variant="body1">
              店舗オーナーの認証および管理画面へのアクセス制御
            </Typography>
            <Typography component="li" variant="body1">
              お問い合わせへの対応
            </Typography>
            <Typography component="li" variant="body1">
              サービスに関する重要なお知らせの送信
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 第3条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第3条（情報の共有・第三者提供）
          </Typography>
          <Typography variant="body1" paragraph>
            当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              ユーザーの同意がある場合
            </Typography>
            <Typography component="li" variant="body1">
              法令に基づく場合
            </Typography>
            <Typography component="li" variant="body1">
              人の生命、身体または財産の保護のために必要がある場合
            </Typography>
            <Typography component="li" variant="body1">
              サービス提供に必要な範囲で業務委託先に提供する場合
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            なお、店舗オーナーが登録した店舗情報・イベント情報は、
            本アプリの利用者に公開されることを前提としています。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第4条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第4条（第三者サービスの利用）
          </Typography>
          <Typography variant="body1" paragraph>
            本アプリでは、以下の第三者サービスを利用しています。
            各サービスにおける情報の取り扱いについては、それぞれのプライバシーポリシーをご確認ください。
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              <strong>Firebase（Google LLC）</strong>：認証、データベース、ストレージ
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Google Maps Platform</strong>：地図表示、位置情報サービス
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Google Sign-In</strong>：店舗オーナーの認証
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* 第5条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第5条（データの保存と管理）
          </Typography>
          <Typography variant="body1" paragraph>
            収集した情報は、適切なセキュリティ対策を講じた上で、
            Firebase（Google Cloud Platform）のサーバーに保存されます。
          </Typography>
          <Typography variant="body1" paragraph>
            一般ユーザーのお気に入り情報は、ユーザーの端末内にローカル保存され、
            当社のサーバーには送信されません。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第6条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第6条（ユーザーの権利）
          </Typography>
          <Typography variant="body1" paragraph>
            ユーザーは、以下の権利を有します。
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body1">
              自己の個人情報の開示を請求する権利
            </Typography>
            <Typography component="li" variant="body1">
              個人情報の訂正、追加または削除を請求する権利
            </Typography>
            <Typography component="li" variant="body1">
              個人情報の利用停止を請求する権利
            </Typography>
            <Typography component="li" variant="body1">
              位置情報の取得を拒否する権利（端末の設定で変更可能）
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            店舗オーナーは、管理画面から自己の店舗情報を編集・削除することができます。
            アカウントの削除をご希望の場合は、お問い合わせください。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第7条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第7条（Cookieの使用）
          </Typography>
          <Typography variant="body1" paragraph>
            本アプリのウェブ版（管理画面）では、セッション管理のためにCookieを使用しています。
            Cookieを無効にした場合、一部の機能が利用できなくなる可能性があります。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第8条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第8条（子どものプライバシー）
          </Typography>
          <Typography variant="body1" paragraph>
            本アプリは、13歳未満の子どもから意図的に個人情報を収集することはありません。
            13歳未満のお子様が個人情報を提供したことが判明した場合は、
            速やかに削除いたします。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第9条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第9条（プライバシーポリシーの変更）
          </Typography>
          <Typography variant="body1" paragraph>
            当社は、必要に応じて本プライバシーポリシーを変更することがあります。
            重要な変更がある場合は、本アプリ内またはウェブサイトでお知らせします。
            変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* 第10条 */}
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            第10条（お問い合わせ）
          </Typography>
          <Typography variant="body1" paragraph>
            本プライバシーポリシーに関するお問い合わせは、下記までご連絡ください。
          </Typography>
          <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              85-Store
            </Typography>
            <Typography variant="body2" color="text.secondary">
              住所: 富山県南砺市本町四丁目100番地
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@85-store.com
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
