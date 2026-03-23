import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import MatchDetailPage from '@/pages/MatchDetailPage'
import BookingConfirmPage from '@/pages/BookingConfirmPage'
import BookingHistoryPage from '@/pages/BookingHistoryPage'
import ProfilePage from '@/pages/ProfilePage'
import BookingDetailPage from "@/pages/BookingDetailPage"
import PaymentResultPage from './pages/PaymentResultPage'
import MatchesPage from './pages/MatchesPage'
import StadiumsPage from './pages/StadiumsPage'
import StadiumDetailPage from './pages/StadiumDetailPage'
import NewsPage from './pages/NewsPage'
import { useAuthLogoutListener } from '@/hooks/useAuthLogoutListener'

// ── Guard component ──────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null)
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

export default function App() {
  useAuthLogoutListener()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/my-bookings" element={<BookingHistoryPage />} />
        <Route path="/stadiums" element={<StadiumsPage />} />
        <Route path="/stadiums/:name" element={<StadiumDetailPage />} />
        <Route path="/news" element={<NewsPage />} />

        {/* Protected routes */}
        <Route path="/bookings/:id/confirm" element={
          <ProtectedRoute><BookingConfirmPage /></ProtectedRoute>
        } />
        <Route path="/payment/result" element={<PaymentResultPage />} />
        <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
        <Route path="/bookings" element={
          <ProtectedRoute><BookingHistoryPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}