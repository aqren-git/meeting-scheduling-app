import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PublicCalendar from '@/pages/PublicCalendar'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<PublicCalendar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
