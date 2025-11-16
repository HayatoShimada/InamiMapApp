import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { IMAGE_CONSTRAINTS } from '../../../shared/constants';

interface UseImageUploadOptions {
  path: string; // Storage内のパス (例: 'shops/shopId' or 'events/eventId')
  maxImages?: number;
}

interface ImageUploadState {
  uploading: boolean;
  progress: number;
  error: string;
  uploadedUrls: string[];
}

export function useImageUpload({ path, maxImages = IMAGE_CONSTRAINTS.MAX_IMAGES_PER_ITEM }: UseImageUploadOptions) {
  const [state, setState] = useState<ImageUploadState>({
    uploading: false,
    progress: 0,
    error: '',
    uploadedUrls: [],
  });

  // ファイルのバリデーション
  const validateFile = (file: File): string | null => {
    if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
      return `ファイルサイズが大きすぎます。${Math.round(IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024))}MB以下にしてください。`;
    }

    if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
      return 'サポートされていないファイル形式です。JPEG、PNG、WebPのみ対応しています。';
    }

    return null;
  };

  // 複数ファイルのアップロード
  const uploadImages = async (files: File[], existingUrls: string[] = []): Promise<string[]> => {
    const totalImages = files.length + existingUrls.length;
    
    if (totalImages > maxImages) {
      throw new Error(`画像は最大${maxImages}枚までアップロードできます。`);
    }

    setState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: '',
    }));

    try {
      const uploadPromises = files.map(async (file, index) => {
        // ファイルバリデーション
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // ファイル名生成（タイムスタンプ + ランダム文字列）
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2);
        const fileExtension = file.name.split('.').pop();
        const fileName = `image_${timestamp}_${randomStr}.${fileExtension}`;

        // Storage参照を作成
        const imageRef = ref(storage, `${path}/${fileName}`);

        // アップロード実行
        const snapshot = await uploadBytes(imageRef, file);
        
        // プログレス更新
        const progressPercent = ((index + 1) / files.length) * 100;
        setState(prev => ({
          ...prev,
          progress: progressPercent,
        }));

        // ダウンロードURLを取得
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      });

      const newUrls = await Promise.all(uploadPromises);
      const allUrls = [...existingUrls, ...newUrls];

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        uploadedUrls: allUrls,
      }));

      return allUrls;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error.message,
      }));
      throw error;
    }
  };

  // 画像を削除
  const deleteImage = async (imageUrl: string, currentUrls: string[]): Promise<string[]> => {
    try {
      setState(prev => ({ ...prev, error: '' }));

      // Storage参照を作成（URLから）
      const imageRef = ref(storage, imageUrl);
      
      // Storageから削除
      await deleteObject(imageRef);
      
      // URLリストから除外
      const updatedUrls = currentUrls.filter(url => url !== imageUrl);
      
      setState(prev => ({
        ...prev,
        uploadedUrls: updatedUrls,
      }));

      return updatedUrls;
    } catch (error: any) {
      console.error('画像削除エラー:', error);
      setState(prev => ({
        ...prev,
        error: '画像の削除に失敗しました。',
      }));
      throw error;
    }
  };

  // 全ての画像を削除
  const deleteAllImages = async (imageUrls: string[]): Promise<void> => {
    try {
      const deletePromises = imageUrls.map(url => {
        const imageRef = ref(storage, url);
        return deleteObject(imageRef);
      });

      await Promise.all(deletePromises);
      
      setState(prev => ({
        ...prev,
        uploadedUrls: [],
      }));
    } catch (error: any) {
      console.error('全画像削除エラー:', error);
      throw error;
    }
  };

  // エラーをクリア
  const clearError = () => {
    setState(prev => ({ ...prev, error: '' }));
  };

  return {
    ...state,
    uploadImages,
    deleteImage,
    deleteAllImages,
    clearError,
    validateFile,
    maxImages,
  };
}