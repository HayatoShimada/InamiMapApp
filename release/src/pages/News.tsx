import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material'

interface NewsItem {
  id: number
  date: string
  category: string
  title: string
  content: string
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    date: '2025-11-24',
    category: 'リリース',
    title: 'とことこ井波マップ v1.0 リリース',
    content:
      'とことこ井波マップの初版をリリースしました。南砺市井波の店舗やイベント情報を地図上で確認できます。',
  },
  {
    id: 2,
    date: '2025-11-20',
    category: 'お知らせ',
    title: 'アプリ公開準備中',
    content:
      'iOS版とAndroid版の公開準備を進めています。もうしばらくお待ちください。',
  },
  {
    id: 3,
    date: '2025-11-15',
    category: '機能追加',
    title: 'イベントカテゴリ機能を追加',
    content:
      'イベント情報にカテゴリを設定できるようになりました。祭り・イベント、ワークショップ、展示・ギャラリーなどから選択できます。',
  },
]

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'リリース':
      return 'success'
    case 'お知らせ':
      return 'info'
    case '機能追加':
      return 'primary'
    case '不具合修正':
      return 'warning'
    default:
      return 'default'
  }
}

export default function News() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" fontWeight={700}>
            ニュース
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            とことこ井波マップの最新情報をお届けします
          </Typography>
        </Container>
      </Box>

      {/* News List */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        {newsItems.map((news, index) => (
          <Box key={news.id}>
            <Card elevation={0} sx={{ bgcolor: 'transparent' }}>
              <CardContent sx={{ px: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {news.date}
                  </Typography>
                  <Chip
                    label={news.category}
                    size="small"
                    color={getCategoryColor(news.category) as 'success' | 'info' | 'primary' | 'warning' | 'default'}
                  />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {news.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {news.content}
                </Typography>
              </CardContent>
            </Card>
            {index < newsItems.length - 1 && <Divider sx={{ my: 3 }} />}
          </Box>
        ))}

        {newsItems.length === 0 && (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            ニュースはまだありません
          </Typography>
        )}
      </Container>
    </Box>
  )
}
