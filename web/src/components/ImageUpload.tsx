import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Grid,
  Button,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Add,
} from '@mui/icons-material';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploadProps {
  path: string; // Storage内のパス
  initialImages?: string[]; // 既存の画像URL
  onImagesChange: (urls: string[]) => void; // 画像URL変更時のコールバック
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({ 
  path, 
  initialImages = [], 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [currentImages, setCurrentImages] = useState<string[]>(initialImages);
  const { 
    uploading, 
    progress, 
    error, 
    uploadImages, 
    deleteImage, 
    clearError,
    validateFile 
  } = useImageUpload({ path, maxImages });

  // ドラッグ&ドロップまたはファイル選択
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || uploading) return;

    try {
      clearError();
      const newUrls = await uploadImages(acceptedFiles, currentImages);
      setCurrentImages(newUrls);
      onImagesChange(newUrls);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
    }
  }, [currentImages, uploadImages, onImagesChange, disabled, uploading, clearError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    disabled: disabled || uploading || currentImages.length >= maxImages,
  });

  // 画像削除
  const handleDeleteImage = async (imageUrl: string) => {
    if (disabled) return;

    try {
      const updatedUrls = await deleteImage(imageUrl, currentImages);
      setCurrentImages(updatedUrls);
      onImagesChange(updatedUrls);
    } catch (error) {
      console.error('画像削除エラー:', error);
    }
  };

  const canAddMore = currentImages.length < maxImages;

  return (
    <Box>
      {/* アップロードエリア */}
      {canAddMore && (
        <Card
          {...getRootProps()}
          sx={{
            p: 3,
            mb: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            '&:hover': {
              borderColor: disabled || uploading ? 'grey.300' : 'primary.main',
              backgroundColor: disabled || uploading ? 'background.paper' : 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? '画像をドロップしてください' : '画像をアップロード'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ドラッグ&ドロップまたはクリックして画像を選択
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              最大{maxImages}枚、10MB以下のJPEG・PNG・WebPファイル
            </Typography>
            <Typography variant="caption" color="primary">
              ({currentImages.length}/{maxImages}枚使用中)
            </Typography>
          </Box>
        </Card>
      )}

      {/* アップロード進行状況 */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            アップロード中... {Math.round(progress)}%
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 画像プレビュー */}
      {currentImages.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            アップロード済み画像 ({currentImages.length}/{maxImages})
          </Typography>
          <Grid container spacing={2}>
            {currentImages.map((imageUrl, index) => (
              <Grid item xs={6} sm={4} md={3} key={imageUrl}>
                <Card>
                  <CardMedia
                    component="img"
                    height="150"
                    image={imageUrl}
                    alt={`画像 ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      画像 {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteImage(imageUrl)}
                      disabled={disabled}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 画像がない場合のメッセージ */}
      {currentImages.length === 0 && !canAddMore && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          画像がアップロードされていません
        </Typography>
      )}
    </Box>
  );
}