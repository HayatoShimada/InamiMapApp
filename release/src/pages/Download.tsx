import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
} from '@mui/material'
import AndroidIcon from '@mui/icons-material/Android'
import AppleIcon from '@mui/icons-material/Apple'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'

const requirements = {
  android: [
    'Android 6.0 (Marshmallow) 以上',
    'Google Play サービスがインストールされていること',
    'インターネット接続（初回起動時）',
    'GPS機能（位置情報を使用する場合）',
  ],
  ios: [
    'iOS 13.0 以上',
    'iPhone 6s 以降',
    'インターネット接続（初回起動時）',
    'GPS機能（位置情報を使用する場合）',
  ],
}

const features = [
  '井波の店舗情報を地図上で確認',
  'イベント・祭り情報の配信',
  'お気に入り登録機能',
  'ルート案内機能',
  '完全無料・広告なし',
]

export default function Download() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700}>
            ダウンロード
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            とことこ井波マップをダウンロードして井波を楽しもう
          </Typography>
        </Container>
      </Box>

      {/* Download Buttons */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <PhoneIphoneIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h2" fontWeight={600} mb={1}>
            とことこ井波マップ
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Chip label="無料" color="success" size="small" />
            <Chip label="広告なし" color="primary" size="small" />
            <Chip label="v1.0.0" variant="outlined" size="small" />
          </Box>
          <Typography variant="body1" color="text.secondary" mb={4}>
            南砺市井波の店舗・イベント情報を発信するアプリ
          </Typography>
        </Box>

        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 4 }}>
          現在、アプリストアへの公開準備中です。公開までもうしばらくお待ちください。
        </Alert>

        <Grid container spacing={3}>
          {/* Android */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <AndroidIcon sx={{ fontSize: 64, color: '#3DDC84', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Android版
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Google Play ストアからダウンロード
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AndroidIcon />}
                  disabled
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  準備中
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Google Play で近日公開予定
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* iOS */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <AppleIcon sx={{ fontSize: 64, color: '#000', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  iOS版
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  App Store からダウンロード
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AppleIcon />}
                  disabled
                  fullWidth
                  sx={{ mb: 2, bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
                >
                  準備中
                </Button>
                <Typography variant="caption" color="text.secondary">
                  App Store で近日公開予定
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            アプリの特徴
          </Typography>
          <Card elevation={0}>
            <CardContent>
              <List>
                {features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* System Requirements */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={4}>
          動作環境
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AndroidIcon sx={{ color: '#3DDC84', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Android
                  </Typography>
                </Box>
                <List dense>
                  {requirements.android.map((req, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AppleIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    iOS
                  </Typography>
                </Box>
                <List dense>
                  {requirements.ios.map((req, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={req}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Help */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            お困りの場合
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ダウンロードやインストールに問題がある場合は、
            お気軽にお問い合わせください。
          </Typography>
          <Button href="/contact" variant="outlined" color="primary">
            お問い合わせ
          </Button>
        </Container>
      </Box>
    </Box>
  )
}
