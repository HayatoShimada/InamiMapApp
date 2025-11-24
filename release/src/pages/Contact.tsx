import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Link as MuiLink,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EmailIcon from '@mui/icons-material/Email'
import XIcon from '@mui/icons-material/X'
import GitHubIcon from '@mui/icons-material/GitHub'

const contactInfo = [
  {
    icon: <LocationOnIcon sx={{ fontSize: 32 }} />,
    title: '住所',
    content: '富山県南砺市本町四丁目100番地',
  },
  {
    icon: <EmailIcon sx={{ fontSize: 32 }} />,
    title: 'メール',
    content: 'info@85-store.com',
    link: 'mailto:info@85-store.com',
  },
]

const socialLinks = [
  {
    icon: <XIcon sx={{ fontSize: 32 }} />,
    title: 'X (旧Twitter)',
    description: '最新情報を配信しています',
    link: 'https://x.com/',
  },
  {
    icon: <GitHubIcon sx={{ fontSize: 32 }} />,
    title: 'GitHub',
    description: 'ソースコードと開発情報',
    link: 'https://github.com/HayatoShimada/InamiMapApp',
  },
]

export default function Contact() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700}>
            お問い合わせ
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            ご質問・ご要望がございましたらお気軽にお問い合わせください
          </Typography>
        </Container>
      </Box>

      {/* Contact Info */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={4}>
          運営情報
        </Typography>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          85-Store
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{info.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {info.title}
                  </Typography>
                  {info.link ? (
                    <MuiLink
                      href={info.link}
                      color="text.secondary"
                      underline="hover"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {info.content}
                    </MuiLink>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {info.content}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Social Links */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight={600} mb={4}>
            SNS・開発情報
          </Typography>
          <Grid container spacing={3}>
            {socialLinks.map((social, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  component="a"
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 3,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <Box sx={{ color: 'primary.main', mr: 2 }}>{social.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {social.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {social.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Bug Report */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" fontWeight={600} mb={3}>
          不具合報告・機能要望
        </Typography>
        <Typography variant="body1" paragraph>
          アプリの不具合や機能のご要望は、以下の方法でお送りください：
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" paragraph>
            <strong>GitHub Issues</strong>:{' '}
            <MuiLink
              href="https://github.com/HayatoShimada/InamiMapApp/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Issue を作成
            </MuiLink>
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            <strong>メール</strong>:{' '}
            <MuiLink href="mailto:info@85-store.com">info@85-store.com</MuiLink>
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          ご報告いただいた内容は、アプリの改善に活用させていただきます。
        </Typography>
      </Container>
    </Box>
  )
}
