import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

const PublicCalendar = lazy(() => import('@/pages/PublicCalendar'))

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-default">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
        <p className="text-sm text-text-secondary">Loading\u2026</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' }, duration: 3000 },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' }, duration: 4000 },
        }}
      />
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/" element={<PublicCalendar />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
