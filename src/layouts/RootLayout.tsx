import { Outlet, Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { Phone, Mail, Settings, MapPin } from 'lucide-react'

export default function RootLayout() {
  const currentYear = new Date().getFullYear()
  const location = useLocation()
  const isServicesPage = location.pathname === ROUTES.SERVICES || location.pathname === ROUTES.EMERGENCY

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {!isServicesPage && (
        <>
          {/* ── Top Contact Info Bar ── */}
          <div className="bg-[#000000] border-b border-[#e59400]/25 text-xs py-2 px-4">
            <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-5">
                <a
                  href="tel:844-473-5426"
                  className="flex items-center gap-1.5 text-[#e59400] hover:text-[#fff3d1] font-semibold transition-colors tracking-wide"
                >
                  <Phone size={12} className="stroke-[2.5]" />
                  <span>844-473-5426</span>
                </a>
                <a
                  href="mailto:info@reliance.services"
                  className="flex items-center gap-1.5 text-[#e59400] hover:text-[#fff3d1] font-semibold transition-colors tracking-wide"
                >
                  <Mail size={12} className="stroke-[2.5]" />
                  <span>info@reliance.services</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider hidden md:inline">
                  Prevailing Wage Certified Company
                </span>
              </div>
            </div>
          </div>

          {/* ── Main Navigation Header ── */}
          <header className="bg-white border-b-2 border-slate-100 sticky top-0 z-40 px-4 py-3 sm:py-4 shadow-sm">
            <div className="max-w-[1100px] mx-auto flex items-center justify-between">
              {/* Logo Brand Block */}
              <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
                <svg className="h-8 sm:h-9 w-auto shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Upper arch (Navy Blue) */}
                  <path d="M20 10 H75 C95 10 105 22 105 38 C105 53 95 62 75 62 H45 V10 H20 Z M45 28 V44 H73 C78 44 82 41 82 36 C82 31 78 28 73 28 H45 Z" fill="#0c478a" />
                  {/* Bottom diagonal leg (Gold) */}
                  <path d="M45 58 L78 90 H105 L72 58 H45 Z" fill="#e59400" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-[#0c478a] leading-none uppercase">
                    Reliance
                  </span>
                  <span className="text-[7px] sm:text-[9px] font-black tracking-[0.16em] text-[#e59400] leading-none mt-1 sm:mt-1.5">
                    BUILDING SERVICES
                  </span>
                </div>
              </Link>

              {/* Navigation Links removed as requested */}
              <div className="flex-1" />

              {/* Action Area */}
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.ADMIN}
                  className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[#0c478a] bg-slate-100 hover:bg-[#eff6ff] hover:text-[#0c478a] hover:border-[#0c478a]/30 border border-slate-200 px-3.5 py-2 transition-all duration-150"
                >
                  <Settings size={13} className="stroke-[2.5]" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            </div>
          </header>

          {/* ── Branded Gold Accent Strip ── */}
          <div className="h-1.5 bg-[#e59400] w-full" />
        </>
      )}

      {/* ── Content View Area ── */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {!isServicesPage && (
        /* ── Branded Footer (as shown in Screenshot 1) ── */
        <footer className="bg-[#000000] border-t border-[#e59400]/25 text-white py-12 px-4">
          <div className="max-w-[1100px] mx-auto flex flex-col items-center justify-between gap-8 md:flex-row md:items-start text-center md:text-left">

            {/* Footer Logo */}
            <div className="flex items-center gap-3">
              <svg className="h-9 w-auto shrink-0" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Upper arch (Blue logo mark) */}
                <path d="M20 10 H75 C95 10 105 22 105 38 C105 53 95 62 75 62 H45 V10 H20 Z M45 28 V44 H73 C78 44 82 41 82 36 C82 31 78 28 73 28 H45 Z" fill="#0c478a" />
                {/* Bottom diagonal leg (Gold) */}
                <path d="M45 58 L78 90 H105 L72 58 H45 Z" fill="#e59400" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none uppercase">
                  Reliance
                </span>
                <span className="text-[8px] sm:text-[9px] font-black tracking-[0.16em] text-[#e59400] leading-none mt-1 sm:mt-1.5">
                  BUILDING SERVICES
                </span>
              </div>
            </div>

            {/* Footer Contact Details */}
            <div className="flex flex-col gap-2.5 text-xs text-white/80 font-semibold tracking-wide">
              <a href="tel:714-944-6113" className="flex items-center justify-center md:justify-start gap-2 hover:text-[#e59400] transition-colors text-white">
                <span className="text-[#e59400] font-black">P:</span> 714-944-6113
              </a>
              <div className="flex items-start justify-center md:justify-start gap-2 max-w-[280px]">
                <MapPin size={14} className="text-[#e59400] shrink-0 mt-0.5" />
                <span>12634 Hoover Street, Garden Grove, CA 92841</span>
              </div>
            </div>
          </div>

          {/* Footer Sub-row Copyright & Licensing */}
          <div className="max-w-[1100px] mx-auto border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/50 font-bold uppercase tracking-wider">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span>&copy; {currentYear} Reliance Building Services</span>
              <span className="hidden sm:inline text-white/20">&middot;</span>
              <span className="text-[#e59400]/80">Lic# 1063345 Dosh #1228</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://reliance.services/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>&middot;</span>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
