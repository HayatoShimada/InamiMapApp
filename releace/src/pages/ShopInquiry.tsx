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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Link as MuiLink,
  Alert,
} from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import PublicIcon from '@mui/icons-material/Public'
import EmailIcon from '@mui/icons-material/Email'

const benefits = [
  '井波を訪れる観光客や地元の方にお店を知ってもらえる',
  '地図上でお店の位置を表示し、来店を促進',
  'イベント情報を配信して集客につなげる',
  '無料で掲載可能',
  '店舗情報の更新がいつでも可能',
]

const steps = [
  {
    label: 'お問い合わせ',
    description: 'メールでお問い合わせください。担当者が詳細をご説明いたします。',
  },
  {
    label: 'アカウント作成',
    description: 'Googleアカウントでログインし、店舗オーナーとして登録します。',
  },
  {
    label: '店舗情報の登録',
    description: '店舗名、住所、営業時間、写真などの情報を入力します。',
  },
  {
    label: '審査・承認',
    description: '運営チームが内容を確認し、承認後にアプリに掲載されます。',
  },
]

const requirements = [
  '南砺市井波エリアで営業している店舗であること',
  'Googleアカウントをお持ちであること',
  '店舗の基本情報（住所、営業時間など）を提供できること',
  '店舗の写真を用意できること（最大5枚）',
]

export default function ShopInquiry() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <StorefrontIcon sx={{ fontSize: 48 }} />
            <Typography variant="h3" component="h1" fontWeight={700}>
              加盟店募集
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            とことこ井波マップにあなたのお店を掲載しませんか？
          </Typography>
        </Container>
      </Box>

      {/* Introduction */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          井波の店舗オーナーの皆様へ
        </Typography>
        <Typography variant="body1" paragraph>
          「とことこ井波マップ」は、南砺市井波の店舗・イベント情報を発信するアプリです。
          地元の方や観光客に向けて、あなたのお店の魅力を伝えてみませんか？
        </Typography>
        <Typography variant="body1" paragraph>
          掲載は<strong>無料</strong>です。店舗情報の登録・更新も、
          専用の管理画面から簡単に行えます。
        </Typography>
      </Container>

      {/* Benefits */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            掲載のメリット
          </Typography>
          <Card elevation={0}>
            <CardContent>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Flow */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={4}>
          掲載までの流れ
        </Typography>
        <Stepper orientation="vertical">
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
      </Container>

      {/* Requirements */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
            掲載条件
          </Typography>
          <Card elevation={0}>
            <CardContent>
              <List>
                {requirements.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          <Alert severity="info" sx={{ mt: 3 }}>
            掲載内容は運営チームの審査があります。公序良俗に反する内容や、
            井波エリア外の店舗はお断りする場合があります。
          </Alert>
        </Container>
      </Box>

      {/* Features for Shop Owners */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={4}>
          店舗オーナー向け機能
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EditIcon sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    店舗情報管理
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  店舗名、住所、営業時間、連絡先、写真などを
                  いつでも更新できます。臨時休業の設定も可能です。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PublicIcon sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    イベント投稿
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ワークショップや特別イベントなどの情報を
                  投稿できます（審査後に公開）。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Contact */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={700} mb={3} textAlign="center">
            お問い合わせ
          </Typography>
          <Typography variant="body1" textAlign="center" mb={4} sx={{ opacity: 0.9 }}>
            掲載をご希望の方、ご質問がある方はお気軽にお問い合わせください
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <EmailIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    メール
                  </Typography>
                  <MuiLink
                    href="mailto:info@85-store.com?subject=とことこ井波マップ加盟店お問い合わせ"
                    color="secondary"
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    info@85-store.com
                  </MuiLink>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    件名に「加盟店お問い合わせ」とご記入ください
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Operator Info */}
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          運営
        </Typography>
        <Typography variant="body1" color="text.secondary">
          85-Store
        </Typography>
        <Typography variant="body2" color="text.secondary">
          富山県南砺市本町四丁目100番地
        </Typography>
      </Container>
    </Box>
  )
}
