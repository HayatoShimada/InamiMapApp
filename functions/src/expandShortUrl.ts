import { https, logger } from 'firebase-functions';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import * as cors from 'cors';

interface ExpandUrlRequest {
  url: string;
}

interface ExpandUrlResponse {
  success: boolean;
  expandedUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}

const corsHandler = cors({ origin: true });

export const expandShortUrl = https.onCall(async (data: ExpandUrlRequest, context): Promise<ExpandUrlResponse> => {
  try {
    const { url } = data;
    
    if (!url) {
      throw new Error('URL is required');
    }

    logger.info('Expanding short URL:', url);

    // 短縮URL（goo.gl, maps.app.goo.gl）の展開を試行
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      try {
        // HEADリクエストでリダイレクト先を取得
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'manual', // リダイレクトを手動で処理
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        let expandedUrl = url;
        
        // リダイレクトされた場合はlocationヘッダーから取得
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          if (location) {
            expandedUrl = location;
            logger.info('Expanded URL found:', expandedUrl);
          }
        } else {
          // リダイレクトがない場合、GETリクエストでHTMLを取得してパース
          const htmlResponse = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (htmlResponse.ok) {
            const html = await htmlResponse.text();
            // HTMLからcanonical URLまたはmeta refreshを探す
            const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
            const metaRefreshMatch = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"';]+)/i);
            
            if (canonicalMatch) {
              expandedUrl = canonicalMatch[1];
            } else if (metaRefreshMatch) {
              expandedUrl = metaRefreshMatch[1];
            }
          }
        }

        // 展開されたURLから座標を抽出
        const coordinates = extractCoordinatesFromUrl(expandedUrl);
        
        return {
          success: true,
          expandedUrl,
          coordinates
        };

      } catch (fetchError) {
        logger.error('Failed to expand short URL:', fetchError);
        
        // フォールバック: URLパターンから推測
        const coordinates = extractCoordinatesFromUrl(url);
        if (coordinates) {
          return {
            success: true,
            expandedUrl: url,
            coordinates
          };
        }
        
        throw new Error('Unable to expand short URL or extract coordinates');
      }
    } else {
      // 通常のURLの場合は座標抽出のみ
      const coordinates = extractCoordinatesFromUrl(url);
      
      return {
        success: true,
        expandedUrl: url,
        coordinates
      };
    }

  } catch (error) {
    logger.error('Error in expandShortUrl:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});

// URLから座標を抽出するヘルパー関数
function extractCoordinatesFromUrl(url: string): { latitude: number; longitude: number } | null {
  try {
    // パターン1: @座標 形式
    const coordinatePattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const coordinateMatch = url.match(coordinatePattern);

    if (coordinateMatch) {
      return {
        latitude: parseFloat(coordinateMatch[1]),
        longitude: parseFloat(coordinateMatch[2])
      };
    }

    // パターン2: place URLの座標
    const placePattern = /place\/[^/]*\/@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const placeMatch = url.match(placePattern);

    if (placeMatch) {
      return {
        latitude: parseFloat(placeMatch[1]),
        longitude: parseFloat(placeMatch[2])
      };
    }

    // パターン3: ?q=座標
    const queryPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = url.match(queryPattern);

    if (queryMatch) {
      return {
        latitude: parseFloat(queryMatch[1]),
        longitude: parseFloat(queryMatch[2])
      };
    }

    return null;
  } catch (error) {
    logger.error('Error extracting coordinates:', error);
    return null;
  }
}