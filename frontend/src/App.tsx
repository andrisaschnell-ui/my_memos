import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ShoppingView from './pages/ShoppingView'
import CalendarView from './pages/CalendarView'
import MessageDetail from './pages/MessageDetail'
import LoginView from './pages/LoginView'
import AdminUsersView from './pages/AdminUsersView'
import { LodgeDashboard } from './pages/LodgeDashboard'
import { ReservationsView } from './pages/ReservationsView'
import { TaskBoardView } from './pages/TaskBoardView'
import { IncidentLogView } from './pages/IncidentLogView'
import { DailyLogView } from './pages/DailyLogView'
import { useTranslation } from './i18n/translations'

function Navigation({ onLogout, lang, toggleLanguage, t }: { onLogout: () => void; lang: 'EN' | 'PT'; toggleLanguage: () => void; t: any }) {
  const location = useLocation()
  const navStyle = (path: string) => ({
    padding: '8px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 14,
    background: location.pathname === path ? '#38bdf8' : 'transparent',
    color: location.pathname === path ? '#0f172a' : '#cbd5e1',
    transition: 'all 0.15s ease'
  })

  const authRole = localStorage.getItem('auth_role') || ''
  const authEmail = localStorage.getItem('auth_email') || ''
  const isAdmin = authRole === 'admin' || authEmail === 'andrisa.schnell@gmail.com'

  return (
    <nav className="no-print" style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>
        🏨 Landco Lodge Assistant
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Link to="/lodge" style={navStyle('/lodge')}>🏠 {t.home}</Link>
        <Link to="/reservations" style={navStyle('/reservations')}>🗓️ {t.reservations}</Link>
        <Link to="/tasks" style={navStyle('/tasks')}>📋 {t.tasks}</Link>
        <Link to="/incidents" style={navStyle('/incidents')}>🚨 {t.incidents}</Link>
        <Link to="/daily-log" style={navStyle('/daily-log')}>📔 {t.dailyLog}</Link>
        <Link to="/" style={navStyle('/')}>🎙️ {t.memos}</Link>
        <Link to="/shopping" style={navStyle('/shopping')}>🛒 {t.shopping}</Link>
        {isAdmin && (
          <Link to="/admin/users" style={navStyle('/admin/users')}>👥 {t.superAdmin}</Link>
        )}

        <button
          onClick={toggleLanguage}
          style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: 20, fontWeight: 800, cursor: 'pointer', marginLeft: 6 }}
          title="Change language / Mudar idioma"
        >
          🌐 {lang === 'EN' ? 'PT-MZ' : 'EN'}
        </button>

        {authEmail && (
          <span style={{ padding: '6px 12px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 20, fontSize: 12, fontWeight: 700, marginLeft: 6 }}>
            👤 {authEmail}
          </span>
        )}

        <button
          onClick={onLogout}
          style={{ padding: '6px 12px', background: '#ef4444', color: '#FFF', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginLeft: 6 }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

function MainRoutes() {
  const navigate = useNavigate();
  const { lang, toggleLanguage, t } = useTranslation();

  return (
    <>
      <Navigation onLogout={() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_email')
        localStorage.removeItem('auth_role')
        window.location.reload();
      }} lang={lang} toggleLanguage={toggleLanguage} t={t} />
      <div style={{ maxWidth: 1250, margin: '0 auto', padding: '16px' }}>
        <Routes>
          <Route path="/lodge" element={<LodgeDashboard onNavigate={(tab) => navigate(`/${tab}`)} lang={lang} />} />
          <Route path="/reservations" element={<ReservationsView />} />
          <Route path="/tasks" element={<TaskBoardView />} />
          <Route path="/incidents" element={<IncidentLogView />} />
          <Route path="/daily-log" element={<DailyLogView />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/shopping" element={<ShoppingView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/message/:id" element={<MessageDetail />} />
          <Route path="/admin/users" element={<AdminUsersView />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) setLoggedIn(true)
  }, [])

  if (!loggedIn) {
    return <LoginView onLoginSuccess={() => setLoggedIn(true)} />
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#090d16', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>
        <MainRoutes />
      </div>
    </BrowserRouter>
  )
}
