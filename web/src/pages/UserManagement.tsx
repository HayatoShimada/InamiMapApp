import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreUser } from '../types/firebase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserManagement() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // 管理者権限チェック
  if (userData?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          管理者権限が必要です。
        </Alert>
      </Container>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [tabValue]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      let usersQuery;
      
      if (tabValue === 0) {
        // 承認待ちユーザー
        usersQuery = query(
          collection(db, 'users'),
          where('approvalStatus', '==', 'pending')
        );
      } else if (tabValue === 1) {
        // 承認済みユーザー
        usersQuery = query(
          collection(db, 'users'),
          where('approvalStatus', '==', 'approved')
        );
      } else {
        // 却下されたユーザー
        usersQuery = query(
          collection(db, 'users'),
          where('approvalStatus', '==', 'rejected')
        );
      }

      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return { uid: doc.id, ...data } as FirestoreUser;
      });

      setUsers(usersData);
    } catch (error: any) {
      console.error('ユーザー取得エラー:', error);
      setError('ユーザーの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        approvalStatus: 'approved',
        approvedAt: serverTimestamp(),
      });

      // リストを更新
      await fetchUsers();
    } catch (error: any) {
      console.error('承認エラー:', error);
      setError('ユーザーの承認に失敗しました。');
    }
  };

  const handleRejectUser = async (userId: string, reason: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        approvalStatus: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
      });

      // リストを更新
      await fetchUsers();
      setApprovalDialog(false);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('却下エラー:', error);
      setError('ユーザーの却下に失敗しました。');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="承認待ち" color="warning" size="small" />;
      case 'approved':
        return <Chip label="承認済み" color="success" size="small" />;
      case 'rejected':
        return <Chip label="却下" color="error" size="small" />;
      default:
        return <Chip label="不明" color="default" size="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <People sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          ユーザー管理
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* タブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="承認待ち" />
          <Tab label="承認済み" />
          <Tab label="却下済み" />
        </Tabs>
      </Box>

      {/* 承認待ちタブ */}
      <TabPanel value={tabValue} index={0}>
        {users.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                承認待ちのユーザーはいません
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ユーザー情報</TableCell>
                  <TableCell>メールアドレス</TableCell>
                  <TableCell>登録日</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName}
                            style={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              marginRight: 12 
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: 'grey.300',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1.5,
                            }}
                          >
                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.displayName || 'ユーザー'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.uid.substring(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{getStatusChip(user.approvalStatus || 'pending')}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApproveUser(user.uid)}
                        sx={{ mr: 1 }}
                      >
                        承認
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setSelectedUser(user);
                          setApprovalDialog(true);
                        }}
                      >
                        却下
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* 承認済みタブ */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ユーザー情報</TableCell>
                <TableCell>メールアドレス</TableCell>
                <TableCell>承認日</TableCell>
                <TableCell>ステータス</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName}
                          style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            marginRight: 12 
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'grey.300',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                          }}
                        >
                          {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.displayName || 'ユーザー'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.uid.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.approvedAt)}</TableCell>
                  <TableCell>{getStatusChip(user.approvalStatus || 'approved')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 却下済みタブ */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ユーザー情報</TableCell>
                <TableCell>メールアドレス</TableCell>
                <TableCell>却下日</TableCell>
                <TableCell>却下理由</TableCell>
                <TableCell>ステータス</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName}
                          style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            marginRight: 12 
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'grey.300',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                          }}
                        >
                          {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.displayName || 'ユーザー'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.uid.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.rejectedAt)}</TableCell>
                  <TableCell>{user.rejectionReason || '理由なし'}</TableCell>
                  <TableCell>{getStatusChip(user.approvalStatus || 'rejected')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 却下理由入力ダイアログ */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ユーザー却下</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            「{selectedUser?.displayName || selectedUser?.email}」を却下しますか？
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="却下理由（任意）"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={() => selectedUser && handleRejectUser(selectedUser.uid, rejectionReason)}
            color="error"
            variant="contained"
          >
            却下
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}