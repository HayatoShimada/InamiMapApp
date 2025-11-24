import { Link } from 'react-router-dom'
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from '@mui/material'
import AndroidIcon from '@mui/icons-material/Android'
import BugReportIcon from '@mui/icons-material/BugReport'
import FeedbackIcon from '@mui/icons-material/Feedback'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import EmailIcon from '@mui/icons-material/Email'
import WarningIcon from '@mui/icons-material/Warning'

const testItems = [
  '地図の表示と操作（ズーム、スクロール）',
  '店舗情報の表示と詳細画面',
  'イベント情報の表示',
  'お気に入り登録機能',
  'カテゴリ別フィルタリング',
  'ルート案内機能',
]

const feedbackItems = [
  'アプリがクラッシュした場合',
  '表示がおかしい、崩れている場合',
  '操作がわかりにくい場合',
  '機能の改善提案',
  'その他気づいた点',
]

const steps = [
  {
    label: 'テスト参加リンクにアクセス',
    description: 'このページ下部の「テストに参加する」ボタンをタップして、Google Playの内部テストページを開きます。必ずAndroidスマートフォンからアクセスしてください。',
  },
  {
    label: 'Googleアカウントでログイン',
    description: 'Google Playで使用しているGoogleアカウントでログインします。普段Google Playストアでアプリをダウンロードする際に使用しているアカウントと同じものを使用してください。',
  },
  {
    label: 'テスターとして登録',
    description: '「テスターになる」または「Accept Invite」ボタンをタップして、テストプログラムに参加します。登録が完了すると、Google Playストアでアプリをダウンロードできるようになります。',
  },
  {
    label: 'Google Playストアでインストール',
    description: 'テスター登録後、表示される「Google Playでダウンロード」リンクをタップするか、Google Playストアで「とことこ井波マップ」を検索してインストールします。※反映まで数分かかる場合があります。',
  },
  {
    label: 'アプリを起動して動作確認',
    description: 'インストール完了後、アプリを起動してください。地図の表示、店舗情報の確認、お気に入り機能などを実際に操作して、動作をご確認ください。',
  },
  {
    label: 'フィードバックを送信',
    description: '不具合や改善点を発見された場合は、このページ下部のフィードバックフォームからご報告ください。皆様のご意見がアプリの改善に役立ちます。',
  },
]

export default function BetaTest() {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6F00 0%, #FFA000 100%)',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BugReportIcon sx={{ fontSize: 48 }} />
            <Box>
              <Chip
                label="Android版"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }}
              />
              <Typography variant="h3" component="h1" fontWeight={700}>
                ベータテスト参加のお願い
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            とことこ井波マップの品質向上にご協力ください
          </Typography>
        </Container>
      </Box>

      {/* Introduction */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <VolunteerActivismIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" component="h2" fontWeight={600} mb={2}>
            テスターを募集しています
          </Typography>
          <Typography variant="body1" color="text.secondary">
            「とことこ井波マップ」Android版の正式リリースに向けて、
            ベータテストにご協力いただける方を募集しています。
            皆様のフィードバックがアプリの品質向上に役立ちます。
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            ベータ版は開発中のバージョンです。不具合やクラッシュが発生する可能性があります。
            ご理解の上、テストにご参加ください。
          </Typography>
        </Alert>
      </Container>

      {/* Download Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={4} textAlign="center">
            テストに参加する
          </Typography>

          <Stepper orientation="vertical" sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={index} active>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </Box>
                  )}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <AndroidIcon sx={{ fontSize: 64, color: '#3DDC84', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Android版ベータテスト
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Google Play 内部テストプログラム
              </Typography>
              <Button
                href="https://play.google.com/apps/internaltest/4701026334155119766"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
                startIcon={<AndroidIcon />}
                sx={{
                  bgcolor: '#3DDC84',
                  '&:hover': { bgcolor: '#2BC573' },
                  px: 4,
                  py: 1.5,
                }}
              >
                テストに参加する
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                Googleアカウントが必要です
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Test Items */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          テストしていただきたい機能
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          以下の機能を実際に操作して、動作を確認していただけると助かります。
        </Typography>
        <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            <List>
              {testItems.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>

      {/* Feedback */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            フィードバックのお願い
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            以下のような点にお気づきの場合は、ぜひフィードバックをお送りください。
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      報告していただきたい内容
                    </Typography>
                  </Box>
                  <List dense>
                    {feedbackItems.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`・${item}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FeedbackIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      フィードバック方法
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    以下の情報と一緒にメールでお送りください：
                  </Typography>
                  <List dense>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="・お使いの端末名（例：Pixel 7）"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="・Androidバージョン"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="・不具合の詳細（発生した操作手順）"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText
                        primary="・スクリーンショット（可能であれば）"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              href="mailto:info@85-store.com?subject=とことこ井波マップ ベータテスト フィードバック"
              variant="contained"
              size="large"
              startIcon={<EmailIcon />}
            >
              フィードバックを送る
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Thank You */}
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          ご協力ありがとうございます
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          皆様のフィードバックにより、より良いアプリをお届けできるよう努めてまいります。
          <br />
          テストにご参加いただいた方には、心より感謝申し上げます。
        </Typography>
        <Button component={Link} to="/" variant="outlined" color="primary">
          トップページに戻る
        </Button>
      </Container>
    </Box>
  )
}
