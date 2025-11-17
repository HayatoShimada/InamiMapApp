import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Query,
  DocumentData,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Firestoreの基本的なCRUD操作を提供するカスタムフック
export function useFirestore<T extends DocumentData>(collectionName: string) {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // ドキュメントを取得
  const getDocument = async (id: string): Promise<T | null> => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      return null;
    } catch (error: any) {
      console.error('ドキュメント取得エラー:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ドキュメントのリストを取得
  const getDocuments = async (queryConstraints?: Query<DocumentData>) => {
    try {
      setLoading(true);
      setError('');
      
      const q = queryConstraints || collection(db, collectionName);
      const querySnapshot = await getDocs(q);
      
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as T[];
      
      setDocuments(docs);
      return docs;
    } catch (error: any) {
      console.error('ドキュメント一覧取得エラー:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ドキュメントを追加
  const addDocument = async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError('');
      
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, collectionName), docData);
      return docRef.id;
    } catch (error: any) {
      console.error('ドキュメント追加エラー:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ドキュメントを更新
  const updateDocument = async (id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setLoading(true);
      setError('');
      
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('ドキュメント更新エラー:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ドキュメントを削除
  const deleteDocument = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('ドキュメント削除エラー:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // クエリビルダー
  const buildQuery = (filters: { field: string; operator: any; value: any }[], orderByField?: string) => {
    let q: Query<DocumentData> = collection(db, collectionName);
    
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }
    
    return q;
  };

  return {
    documents,
    loading,
    error,
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    buildQuery,
  };
}