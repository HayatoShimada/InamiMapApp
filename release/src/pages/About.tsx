import { Link } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GitHubIcon from '@mui/icons-material/GitHub'
import CodeIcon from '@mui/icons-material/Code'

const appFeatures = [
  '井波の店舗情報を地図上で確認',
  'イベント・祭り情報の配信',
  'お気に入り登録機能',
  'ルート案内機能',
  'カテゴリ別検索',
  'オフライン対応（一部機能）',
]

export default function About() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700}>
            アプリについて
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            とことこ井波マップの特徴と開発について
          </Typography>
        </Container>
      </Box>

      {/* App Overview */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          とことこ井波マップとは
        </Typography>
        <Typography variant="body1" paragraph>
          「とことこ井波マップ」は、富山県南砺市井波の店舗・イベント情報を発信するモバイルアプリです。
          地図上で店舗の位置を確認したり、イベント情報をチェックしたりすることができます。
        </Typography>
        <Typography variant="body1" paragraph>
          井波は日本有数の木彫りの里として知られ、瑞泉寺を中心とした門前町として栄えてきました。
          このアプリを通じて、井波の魅力をより多くの方に知っていただければ幸いです。
        </Typography>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            主な機能
          </Typography>
          <Card elevation={0}>
            <CardContent>
              <List>
                {appFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
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

      {/* Technology */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          技術スタック
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  モバイルアプリ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Flutter / Dart を使用して iOS と Android の両プラットフォームに対応しています。
                  Google Maps を活用した地図機能を提供しています。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  バックエンド
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Firebase (Cloud Firestore, Authentication, Storage) を使用してデータ管理と認証を行っています。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Open Source */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            オープンソース開発
          </Typography>
          <Typography variant="body1" paragraph>
            とことこ井波マップはオープンソースプロジェクトとして開発されています。
            コミュニティからの貢献を歓迎しています。
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              href="https://github.com/HayatoShimada/InamiMapApp"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<GitHubIcon />}
            >
              GitHub リポジトリ
            </Button>
            <Button
              href="https://github.com/HayatoShimada/InamiMapApp/issues"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<CodeIcon />}
            >
              Issue を報告
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Operator */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          運営
        </Typography>
        <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              85-Store
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              富山県南砺市本町四丁目100番地
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Email: info@85-store.com
            </Typography>
            <Button component={Link} to="/contact" variant="outlined" size="small">
              お問い合わせ
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
