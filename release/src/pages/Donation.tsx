import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import UpdateIcon from '@mui/icons-material/Update'
import StorageIcon from '@mui/icons-material/Storage'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'

const usages = [
  {
    icon: <StorageIcon />,
    title: 'サーバー運用費',
    description: 'データベースやストレージの維持費用に充てられます',
  },
  {
    icon: <UpdateIcon />,
    title: 'アプリ開発・改善',
    description: '新機能の追加やバグ修正に使用されます',
  },
  {
    icon: <SupportAgentIcon />,
    title: 'サポート体制',
    description: 'ユーザーサポートや問い合わせ対応に活用されます',
  },
]

const benefits = [
  '井波の店舗・イベント情報の継続的な発信',
  'アプリの安定した運用と改善',
  '地域活性化への貢献',
  'オープンソース開発の支援',
]

export default function Donation() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700}>
            寄付・支援
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            とことこ井波マップの運営をご支援ください
          </Typography>
        </Container>
      </Box>

      {/* Introduction */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <VolunteerActivismIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" component="h2" fontWeight={600} mb={2}>
            ご支援のお願い
          </Typography>
          <Typography variant="body1" color="text.secondary">
            とことこ井波マップは、井波の魅力を多くの方に伝えるため、
            無料で提供しています。アプリの継続的な運営と改善のため、
            皆様からのご支援をお願いしております。
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          現在、寄付受付の準備を進めております。準備が整い次第、こちらのページでお知らせいたします。
        </Alert>
      </Container>

      {/* Usage */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={4}>
            寄付金の使途
          </Typography>
          <Grid container spacing={3}>
            {usages.map((usage, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={0} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {usage.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {usage.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {usage.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          ご支援によって実現できること
        </Typography>
        <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>

      {/* Other Ways to Support */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            その他の支援方法
          </Typography>
          <Typography variant="body1" paragraph>
            寄付以外にも、以下の方法でプロジェクトを支援できます：
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    コードで貢献
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    GitHub でソースコードを公開しています。
                    バグ修正や機能追加のプルリクエストを歓迎します。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    口コミで広める
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    アプリを友人や知人に紹介していただくことで、
                    井波の魅力をより多くの方に届けることができます。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Thank You */}
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <FavoriteIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ご支援ありがとうございます
        </Typography>
        <Typography variant="body1" color="text.secondary">
          皆様のご支援により、とことこ井波マップは成長し続けることができます。
          <br />
          心より感謝申し上げます。
        </Typography>
      </Container>
    </Box>
  )
}
