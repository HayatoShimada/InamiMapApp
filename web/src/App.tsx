import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavigation from './components/AppNavigation';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShopForm from './pages/ShopForm';
import ShopList from './pages/ShopList';
import EventForm from './pages/EventForm';
import EventList from './pages/EventList';
import AdminPanel from './pages/AdminPanel';
import PendingApproval from './pages/PendingApproval';
import './App.css';

// Material-UIテーマの設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// レイアウトコンポーネント
function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // ログインページやホームページではヘッダーを表示しない
  const hideHeader = location.pathname === '/login' || location.pathname === '/';
  
  if (hideHeader || !currentUser) {
    return <>{children}</>;
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* ヘッダーを最上部に固定 */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <AppNavigation />
      </Box>
      
      {/* メインコンテンツ - ヘッダーの高さ分マージンを追加 */}
      <Box sx={{ 
        flexGrow: 1, 
        marginTop: '64px', // AppBarのデフォルト高さ
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* 店舗管理ルート */}
            <Route
              path="/shops"
              element={
                <ProtectedRoute>
                  <ShopList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/new"
              element={
                <ProtectedRoute>
                  <ShopForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:id"
              element={
                <ProtectedRoute>
                  <ShopForm />
                </ProtectedRoute>
              }
            />
            {/* イベント管理ルート */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event/new"
              element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/event/:id"
              element={
                <ProtectedRoute>
                  <EventForm />
                </ProtectedRoute>
              }
            />
            {/* 承認待ち画面 */}
            <Route
              path="/pending-approval"
              element={<PendingApproval />}
            />
            {/* 管理者ルート */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;