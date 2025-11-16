import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShopForm from './pages/ShopForm';
import ShopList from './pages/ShopList';
import EventForm from './pages/EventForm';
import EventList from './pages/EventList';
import AdminPanel from './pages/AdminPanel';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;