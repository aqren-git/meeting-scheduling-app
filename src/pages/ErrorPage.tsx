import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'

export default function ErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-red-500">!</span>
          </div>
          <h1 className="text-lg font-semibold text-text-primary mb-2">
            {error.status} — {error.statusText}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Something went wrong while loading this page.
          </p>
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl font-bold text-red-500">!</span>
        </div>
        <h1 className="text-lg font-semibold text-text-primary mb-2">
          Unexpected Error
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
