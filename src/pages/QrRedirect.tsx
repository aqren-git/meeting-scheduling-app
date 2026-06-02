import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'

export default function QrRedirect() {
  return <Navigate to={ROUTES.EMERGENCY} replace />
}
