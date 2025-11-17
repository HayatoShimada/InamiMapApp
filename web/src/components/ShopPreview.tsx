import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
  Divider,
} from '@mui/material';
import {
  Language,
  Instagram,
  Twitter,
  Facebook,
  YouTube,
  Phone,
  Email,
  LocationOn,
  Schedule,
} from '@mui/icons-material';
import { FirestoreShop } from '../types/firebase';

interface ShopPreviewProps {
  shop: FirestoreShop;
  compact?: boolean;
}

export default function ShopPreview({ shop, compact = false }: ShopPreviewProps) {
  const defaultImage = 'https://via.placeholder.com/400x300?text=店舗画像';
  const mainImage = shop.images && shop.images.length > 0 ? shop.images[0] : defaultImage;

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram />;
      case 'twitter': return <Twitter />;
      case 'facebook': return <Facebook />;
      case 'youtube': return <YouTube />;
      default: return <Language />;
    }
  };

  const formatUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const formatSocialUrl = (platform: string, value?: string) => {
    if (!value) return '#';
    
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (value.startsWith('@')) {
      const username = value.substring(1);
      switch (platform) {
        case 'instagram': return `https://instagram.com/${username}`;
        case 'twitter': return `https://twitter.com/${username}`;
        default: return value;
      }
    }

    return value;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height={compact ? 180 : 240}
        image={mainImage}
        alt={shop.shopName}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {shop.shopName}
          </Typography>
          <Chip 
            label={shop.shopCategory} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ mb: 1 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {shop.description}
        </Typography>

        {!compact && shop.maniacPoint && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="primary" fontWeight="bold">
              こだわりポイント
            </Typography>
            <Typography variant="body2">
              {shop.maniacPoint}
            </Typography>
          </Box>
        )}

        {/* 住所 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {shop.address}
          </Typography>
        </Box>

        {/* 営業時間・定休日 */}
        {shop.closedDays && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Schedule fontSize="small" color="action" sx={{ mr: 1, mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary">
              {shop.closedDays}
            </Typography>
          </Box>
        )}

        {/* 連絡先 */}
        <Box sx={{ mb: 2 }}>
          {shop.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
              <Link href={`tel:${shop.phone}`} variant="body2">
                {shop.phone}
              </Link>
            </Box>
          )}
          
          {shop.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Email fontSize="small" color="action" sx={{ mr: 1 }} />
              <Link href={`mailto:${shop.email}`} variant="body2">
                {shop.email}
              </Link>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* オンライン情報 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {shop.googleMapUrl && (
            <IconButton
              size="small"
              href={shop.googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Googleマップで見る"
            >
              <LocationOn />
            </IconButton>
          )}
          
          {shop.website && (
            <IconButton
              size="small"
              href={formatUrl(shop.website)}
              target="_blank"
              rel="noopener noreferrer"
              title="公式ウェブサイト"
            >
              <Language />
            </IconButton>
          )}

          {shop.onlineStore && (
            <IconButton
              size="small"
              href={formatUrl(shop.onlineStore)}
              target="_blank"
              rel="noopener noreferrer"
              title="オンラインストア"
            >
              <Language color="secondary" />
            </IconButton>
          )}

          {/* SNSアカウント */}
          {shop.socialMedia?.instagram && (
            <IconButton
              size="small"
              href={formatSocialUrl('instagram', shop.socialMedia.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <Instagram />
            </IconButton>
          )}

          {shop.socialMedia?.twitter && (
            <IconButton
              size="small"
              href={formatSocialUrl('twitter', shop.socialMedia.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter/X"
            >
              <Twitter />
            </IconButton>
          )}

          {shop.socialMedia?.facebook && (
            <IconButton
              size="small"
              href={shop.socialMedia.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <Facebook />
            </IconButton>
          )}

          {shop.socialMedia?.youtube && (
            <IconButton
              size="small"
              href={shop.socialMedia.youtube}
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
            >
              <YouTube />
            </IconButton>
          )}
        </Box>

        {/* 画像ギャラリー（コンパクト版でない場合） */}
        {!compact && shop.images && shop.images.length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              その他の画像
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
              {shop.images.slice(1, 5).map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt={`${shop.shopName} ${index + 2}`}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}