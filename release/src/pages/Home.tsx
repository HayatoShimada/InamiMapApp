import { Link } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import StorefrontIcon from '@mui/icons-material/Storefront'
import EventIcon from '@mui/icons-material/Event'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import AndroidIcon from '@mui/icons-material/Android'
import AppleIcon from '@mui/icons-material/Apple'

const features = [
  {
    icon: <MapIcon sx={{ fontSize: 48 }} />,
    title: '地図で探す',
    description: '井波の店舗やスポットを地図上で簡単に見つけられます。',
  },
  {
    icon: <StorefrontIcon sx={{ fontSize: 48 }} />,
    title: '店舗情報',
    description: 'お店の詳細情報、営業時間、写真をチェックできます。',
  },
  {
    icon: <EventIcon sx={{ fontSize: 48 }} />,
    title: 'イベント情報',
    description: '井波で開催されるイベントや祭りの情報を確認できます。',
  },
  {
    icon: <DirectionsWalkIcon sx={{ fontSize: 48 }} />,
    title: 'ルート案内',
    description: '目的地までのルートを確認して、井波を散策できます。',
  },
]

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            fontWeight={700}
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}
          >
            とことこ井波マップ
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, mb: 4, opacity: 0.9 }}
          >
            南砺市井波の店舗・イベント情報を発信するアプリ
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/download"
              variant="contained"
              size="large"
              startIcon={<AndroidIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              Android版をダウンロード
            </Button>
            <Button
              component={Link}
              to="/download"
              variant="outlined"
              size="large"
              startIcon={<AppleIcon />}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              iOS版をダウンロード
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight={600}
          mb={6}
        >
          アプリの機能
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Inami Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            fontWeight={600}
            mb={4}
          >
            井波について
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            井波（いなみ）は、富山県南砺市にある歴史ある町です。
            日本有数の木彫りの里として知られ、瑞泉寺を中心とした門前町として栄えてきました。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            八日町通りには多くの木彫工房や店舗が軒を連ね、
            伝統工芸の技を今に伝えています。
            「とことこ井波マップ」で、井波の魅力を発見してください。
          </Typography>
          <Box textAlign="center" mt={4}>
            <Button
              component={Link}
              to="/about"
              variant="outlined"
              color="primary"
              size="large"
            >
              詳しく見る
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={2}>
          今すぐダウンロード
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          無料でご利用いただけます
        </Typography>
        <Button
          component={Link}
          to="/download"
          variant="contained"
          color="primary"
          size="large"
        >
          ダウンロードページへ
        </Button>
      </Container>
    </Box>
  )
}
