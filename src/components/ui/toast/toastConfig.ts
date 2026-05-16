import toast from 'react-hot-toast'

const baseStyle = {
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
  padding: '10px 14px',
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    style: baseStyle,
    iconTheme: { primary: '#16a34a', secondary: '#fff' },
    duration: 3000,
    position: 'top-center',
  })
}

export function showErrorToast(message: string) {
  toast.error(message, {
    style: baseStyle,
    iconTheme: { primary: '#dc2626', secondary: '#fff' },
    duration: 4000,
    position: 'top-center',
  })
}
