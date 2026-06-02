/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import ErrorPage from '@/pages/ErrorPage'
import { ROUTES } from '@/lib/routes'
import { FullPageLoader } from '@/components/ui/full-page-loader/FullPageLoader'

const PublicCalendar = lazy(() => import('@/pages/PublicCalendar'))
const AdminPanel = lazy(() => import('@/pages/AdminPanel'))
const Services = lazy(() => import('@/pages/Services'))

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
      {
        path: ROUTES.SERVICES,
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <Services />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: ROUTES.ADMIN,
    element: (
      <Suspense fallback={<FullPageLoader />}>
        <AdminPanel />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
])
