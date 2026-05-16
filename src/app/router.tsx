import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import ErrorPage from '@/pages/ErrorPage'
import { ROUTES } from '@/lib/routes'

const PublicCalendar = lazy(() => import('@/pages/PublicCalendar'))

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
        <p className="text-sm text-text-secondary">Loading&hellip;</p>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <PublicCalendar />
          </Suspense>
        ),
      },
    ],
  },
])
