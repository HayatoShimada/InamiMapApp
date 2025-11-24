import { Link } from 'react-router-dom'
import { Box, Container, Typography, Grid, IconButton, Divider } from '@mui/material'
import XIcon from '@mui/icons-material/X'
import GitHubIcon from '@mui/icons-material/GitHub'
import EmailIcon from '@mui/icons-material/Email'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.100', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
              とことこ井波マップ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              南砺市井波の店舗・イベント情報を
              <br />
              発信するアプリです。
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              リンク
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                component={Link}
                to="/about"
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                アプリについて
              </Typography>
              <Typography
                component={Link}
                to="/download"
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                ダウンロード
              </Typography>
              <Typography
                component={Link}
                to="/shop-inquiry"
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                加盟店募集
              </Typography>
              <Typography
                component={Link}
                to="/news"
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                ニュース
              </Typography>
              <Typography
                component={Link}
                to="/contact"
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                お問い合わせ
              </Typography>
              <Typography
                component={Link}
                to="/privacy"
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                プライバシーポリシー
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              運営
            </Typography>
            <Typography variant="body2" color="text.secondary">
              85-Store
            </Typography>
            <Typography variant="body2" color="text.secondary">
              富山県南砺市本町四丁目100番地
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <XIcon />
              </IconButton>
              <IconButton
                href="https://github.com/HayatoShimada/InamiMapApp"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                href="mailto:info@85-store.com"
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <EmailIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} 85-Store. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}
