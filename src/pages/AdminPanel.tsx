import { useState, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { Calendar, Users, Building2, BookOpen, Settings, ArrowLeft } from 'lucide-react'

const SlotManager = lazy(() => import('@/components/admin/SlotManager').then((m) => ({ default: m.SlotManager })))
const CrewManager = lazy(() => import('@/components/admin/CrewManager').then((m) => ({ default: m.CrewManager })))
const PropertyManager = lazy(() => import('@/components/admin/PropertyManager').then((m) => ({ default: m.PropertyManager })))
const BookingsList = lazy(() => import('@/components/admin/BookingsList').then((m) => ({ default: m.BookingsList })))
const SettingsPanel = lazy(() => import('@/components/admin/SettingsPanel').then((m) => ({ default: m.SettingsPanel })))

type AdminTab = 'slots' | 'crews' | 'properties' | 'bookings' | 'settings'

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'slots', label: 'Slots', icon: <Calendar size={16} /> },
  { id: 'crews', label: 'Crews', icon: <Users size={16} /> },
  { id: 'properties', label: 'Properties', icon: <Building2 size={16} /> },
  { id: 'bookings', label: 'Bookings', icon: <BookOpen size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
]

function TabContent({ tab }: { tab: AdminTab }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
        </div>
      }
    >
      {tab === 'slots' && <SlotManager />}
      {tab === 'crews' && <CrewManager />}
      {tab === 'properties' && <PropertyManager />}
      {tab === 'bookings' && <BookingsList />}
      {tab === 'settings' && <SettingsPanel />}
    </Suspense>
  )
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('slots')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface flex flex-col sm:flex-row">
      {/* ── Mobile Tab Bar ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around py-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSidebarOpen(false) }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors
              ${activeTab === t.id ? 'text-brand' : 'text-text-muted'}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden sm:flex sm:flex-col w-56 bg-white border-r border-border shrink-0 min-h-screen">
        <div className="p-4 border-b border-border">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-brand transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Calendar
          </Link>
          <h1 className="text-base font-semibold text-text-primary mt-2">Admin Panel</h1>
          <p className="text-xs text-text-muted mt-0.5">Reliance Scheduling</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all text-left
                ${activeTab === t.id
                  ? 'bg-brand-light text-brand border-l-[3px] border-brand ml-0'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border-l-[3px] border-transparent ml-0'
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-text-muted">
            Demo Mode &middot; No Auth
          </p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto pb-20 sm:pb-0">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <TabContent tab={activeTab} />
        </div>
      </main>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
