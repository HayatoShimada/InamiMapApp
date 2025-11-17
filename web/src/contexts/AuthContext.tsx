import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { FirestoreUser } from '../types/firebase';

interface AuthContextType {
  currentUser: User | null;
  userData: FirestoreUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Google認証でサインイン
  const signInWithGoogle = async () => {
    try {
      console.log('Google認証を開始します...');
      console.log('Auth emulator:', (auth as any)._delegate?.emulatorConfig);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google認証成功:', user.email);
      
      // Firestoreにユーザー情報を保存（初回ログイン時）
      await saveUserToFirestore(user);
    } catch (error) {
      console.error('Google認証エラー:', error);
      throw error;
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  // Firestoreにユーザー情報を保存
  const saveUserToFirestore = async (user: User) => {
    if (!user.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 初回ログイン時のみユーザー情報を作成
      const firestoreUser: Omit<FirestoreUser, 'uid'> = {
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || undefined,
        role: 'shop_owner', // デフォルトは店主権限
        approvalStatus: 'pending', // 新規ユーザーは承認待ち
        createdAt: serverTimestamp() as any,
      };
      
      await setDoc(userRef, firestoreUser);
    }
  };

  // Firestoreからユーザーデータを取得
  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = { uid, ...userDoc.data() } as FirestoreUser;
        setUserData(data);
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}