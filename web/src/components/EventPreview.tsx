import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Group,
} from '@mui/icons-material';
import { FirestoreEvent, EVENT_PROGRESS_LABELS, APPROVAL_STATUS_LABELS } from '../types/firebase';

interface EventPreviewProps {
  event: FirestoreEvent;
  compact?: boolean;
}

export default function EventPreview({ event, compact = false }: EventPreviewProps) {
  const defaultImage = 'https://via.placeholder.com/400x300?text=イベント画像';
  const mainImage = event.images && event.images.length > 0 ? event.images[0] : defaultImage;

  const formatDate = (timestamp: any) => {
    try {
      let date: Date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '日時不明';
    }
  };

  const getProgressChipColor = (progress: string) => {
    switch (progress) {
      case 'scheduled': return 'info';
      case 'ongoing': return 'success';
      case 'finished': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getApprovalChipColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height={compact ? 180 : 240}
        image={mainImage}
        alt={event.eventName}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {event.eventName}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={APPROVAL_STATUS_LABELS[event.approvalStatus as keyof typeof APPROVAL_STATUS_LABELS]} 
              size="small" 
              color={getApprovalChipColor(event.approvalStatus) as any}
              variant="outlined"
            />
            <Chip 
              label={EVENT_PROGRESS_LABELS[event.eventProgress as keyof typeof EVENT_PROGRESS_LABELS]} 
              size="small" 
              color={getProgressChipColor(event.eventProgress) as any}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {event.description}
        </Typography>

        {/* 開催日時 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Schedule fontSize="small" color="action" sx={{ mr: 1, mt: 0.2 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>開始:</strong> {formatDate(event.eventTimeStart)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>終了:</strong> {formatDate(event.eventTimeEnd)}
            </Typography>
          </Box>
        </Box>

        {/* 開催場所 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {event.location}
          </Typography>
        </Box>

        {/* 参加店舗 */}
        {event.participatingShops && event.participatingShops.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Group fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              参加店舗: {event.participatingShops.length}店舗
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 追加情報 */}
        <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            作成日: {formatDate(event.createdAt)}
          </Typography>
          
          {event.shopId && (
            <Typography variant="caption" color="text.secondary">
              店舗イベント
            </Typography>
          )}
        </Box>

        {/* 画像ギャラリー（コンパクト版でない場合） */}
        {!compact && event.images && event.images.length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              その他の画像
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
              {event.images.slice(1, 5).map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt={`${event.eventName} ${index + 2}`}
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