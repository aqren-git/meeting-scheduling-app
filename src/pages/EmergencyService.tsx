import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Phone,
  ArrowRight,
  Clock,
  Award,
  Zap,
  MapPin,
  Mail,
} from 'lucide-react'
import { showSuccessToast, showErrorToast } from '../components/ui/toast/toastConfig'
import { ROUTES } from '@/lib/routes'

const COUNTRY_CODES = [
  { code: '+1', label: '+1 US/CA' },
  { code: '+44', label: '+44 UK' },
  { code: '+61', label: '+61 AU' },
  { code: '+91', label: '+91 IN' },
  { code: '+52', label: '+52 MX' },
]

const STEPS = [
  {
    num: '1',
    title: 'Shut off the source',
    text: 'Turn off the main valve or unit shutoff if safe to do so.',
  },
  {
    num: '2',
    title: 'Document everything',
    text: 'Photos and video before touching anything — protects your records.',
  },
  {
    num: '3',
    title: 'No fans or movement',
    text: 'Improper drying spreads mold within 24–48 hrs.',
  },
  {
    num: '4',
    title: 'Limit access',
    text: 'Keep residents out of affected areas until our team assesses.',
  },
]

const TRUST = [
  { icon: Zap,   text: 'Same-Day On-Site' },
  { icon: Clock, text: 'Residents Back Faster' },
  { icon: Award, text: 'Prevailing Wage Certified' },
]

function formatLocal(value: string, code: string): string {
  const digits = value.replace(/\D/g, '').slice(0, code === '+1' ? 10 : 15)
  if (code !== '+1') return digits
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const inputCls =
  'bg-[#252525] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/25 outline-none focus:ring-2 focus:ring-[#dc2626]/40 focus:border-[#dc2626]/40 transition-all w-full'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-white/55 uppercase tracking-wider">
        {label}
        {required && <span className="text-[#ff6b7a] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function EmergencyService() {
  const [severity, setSeverity] = useState<'Minor' | 'Moderate' | 'Severe'>('Moderate')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    propertyAddress: '',
    nameAndRole: '',
    countryCode: '+1',
    phone: '',
    lossType: '',
    unitsAffected: '',
  })

  function setField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.propertyAddress.trim()) { showErrorToast('Property address is required.'); return }
    if (!form.nameAndRole.trim())     { showErrorToast('Your name and role are required.'); return }
    if (!form.phone.trim())           { showErrorToast('Callback number is required.'); return }
    if (!form.lossType.trim())        { showErrorToast('Type of loss is required.'); return }

    setSubmitting(true)
    try {
      const e164Phone = form.countryCode + form.phone.replace(/\D/g, '')
      await fetch(import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          propertyAddress: form.propertyAddress,
          nameAndRole: form.nameAndRole,
          phoneNumber: e164Phone,
          lossType: form.lossType,
          unitsAffected: form.unitsAffected,
          severity,
        }),
      })
      showSuccessToast('Loss report submitted!')
      setForm({ propertyAddress: '', nameAndRole: '', countryCode: '+1', phone: '', lossType: '', unitsAffected: '' })
      setSeverity('Moderate')
    } catch {
      showErrorToast('Failed to submit. Please call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between shrink-0">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <svg className="h-8 w-auto shrink-0" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10 H75 C95 10 105 22 105 38 C105 53 95 62 75 62 H45 V10 H20 Z M45 28 V44 H73 C78 44 82 41 82 36 C82 31 78 28 73 28 H45 Z" fill="#0c478a" />
            <path d="M45 58 L78 90 H105 L72 58 H45 Z" fill="#e59400" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-white uppercase">Reliance</span>
            <span className="text-[8px] font-black tracking-[0.16em] text-[#e59400] mt-0.5">BUILDING SERVICES</span>
          </div>
        </Link>
        <a
          href="tel:844-473-5426"
          className="flex items-center gap-2 text-[#e59400] hover:text-[#ffd066] font-bold text-sm transition-colors"
        >
          <Phone size={14} className="stroke-[2.5]" />
          <span className="hidden sm:inline">844-473-5426</span>
          <span className="sm:hidden">Call Now</span>
        </a>
      </header>

      {/* ── Hero ── */}
      <div className="relative bg-[#dc2626] overflow-hidden shrink-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-5">
            <AlertTriangle size={14} className="text-white/80" />
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90">Emergency Services</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Emergency Response,<br className="hidden sm:block" /> Available 24/7
          </h1>
          <p className="text-base md:text-lg text-white/85 mt-4 font-medium max-w-lg mx-auto leading-relaxed">
            A specialist is on call around the clock. Call us directly or submit the form below — we respond same day.
          </p>
          <a
            href="tel:844-473-5426"
            className="inline-flex items-center gap-3 mt-8 bg-white text-[#dc2626] rounded-full px-8 py-4 font-black text-base hover:bg-white/95 transition-all active:scale-[0.98] shadow-xl shadow-black/30"
          >
            <Phone size={18} className="stroke-[2.5]" />
            (844) 473-5426 — Tap to Call
          </a>
        </div>
        <div className="h-10 bg-[#111111]" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-14 items-start">

          {/* Left: steps + trust */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/40 mb-4">
                While you wait — do this now
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STEPS.map((step) => (
                  <div
                    key={step.num}
                    className="bg-[#1e1e1e] border border-white/8 rounded-2xl p-4 flex items-start gap-3.5 hover:border-[#dc2626]/30 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#dc2626]/15 text-[#ff6b7a] flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ring-1 ring-[#dc2626]/25">
                      {step.num}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90 leading-snug">{step.title}</p>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/8 pt-6">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/40 mb-3">Built on One Principle</p>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Our goal is to get the resident back into the unit as quickly as possible.{' '}
                <span className="text-white/85 font-semibold">Everything we do is based on this one principle.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {TRUST.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 bg-[#1e1e1e] border border-white/8 rounded-xl px-4 py-3 flex-1">
                    <Icon size={16} className="text-[#e59400] shrink-0" />
                    <span className="text-xs font-bold text-white/75">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-[#dc2626]/10 border-b border-[#dc2626]/20 px-6 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ff6b7a]">Submit a loss report</p>
                <p className="text-xs text-white/50 mt-0.5">Required fields marked <span className="text-[#ff6b7a]">*</span></p>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">
                <Field label="Property address" required>
                  <input type="text" value={form.propertyAddress} onChange={(e) => setField('propertyAddress', e.target.value)} placeholder="123 Main St, Unit 4B" className={inputCls} />
                </Field>

                <Field label="Your name and role" required>
                  <input type="text" value={form.nameAndRole} onChange={(e) => setField('nameAndRole', e.target.value)} placeholder="Jane Smith — Property Manager" className={inputCls} />
                </Field>

                <Field label="Best callback number" required>
                  <div className="flex gap-2 min-w-0">
                    <select
                      value={form.countryCode}
                      onChange={(e) => { setField('countryCode', e.target.value); setField('phone', '') }}
                      className="shrink-0 bg-[#252525] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:ring-2 focus:ring-[#dc2626]/40 transition-all"
                    >
                      {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField('phone', formatLocal(e.target.value, form.countryCode))}
                      placeholder={form.countryCode === '+1' ? '(555) 000-0000' : 'Phone number'}
                      className={`${inputCls} flex-1 min-w-0`}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Type of loss" required>
                    <input type="text" value={form.lossType} onChange={(e) => setField('lossType', e.target.value)} placeholder="Burst pipe / flooding…" className={inputCls} />
                  </Field>
                  <Field label="Units affected">
                    <input type="text" value={form.unitsAffected} onChange={(e) => setField('unitsAffected', e.target.value)} placeholder="e.g. 3 units, 1 floor" className={inputCls} />
                  </Field>
                </div>

                <Field label="Severity">
                  <div className="grid grid-cols-3 gap-2">
                    {(['Minor', 'Moderate', 'Severe'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`rounded-xl py-2.5 text-sm font-bold transition-all ${
                          severity === level
                            ? 'bg-[#dc2626]/20 text-[#ff6b7a] ring-1 ring-[#dc2626]/50'
                            : 'bg-[#2a2a2a] text-white/50 hover:text-white/80 hover:bg-[#333]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </Field>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full mt-1 bg-[#dc2626] hover:bg-[#c41f1f] text-white rounded-xl py-3.5 text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#dc2626]/20"
                >
                  {submitting ? 'Submitting…' : 'Submit Loss Report'}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 mt-4 px-4 md:px-8 py-8 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/35 font-semibold">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} Reliance Building Services</span>
            <span className="hidden sm:inline text-white/15">·</span>
            <span className="text-[#e59400]/60">Lic# 1063345 · Dosh #1228</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:info@reliance.services" className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
              <Mail size={12} />
              info@reliance.services
            </a>
            <a href="tel:844-473-5426" className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
              <Phone size={12} />
              844-473-5426
            </a>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-3 flex items-center gap-2 text-xs text-white/25 font-medium">
          <MapPin size={11} className="shrink-0" />
          12634 Hoover Street, Garden Grove, CA 92841
        </div>
      </footer>

    </div>
  )
}
