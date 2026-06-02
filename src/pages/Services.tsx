import { useState } from 'react'
import { AlertTriangle, Phone, ArrowRight, ChevronDown } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '../components/ui/toast/toastConfig'

const COUNTRY_CODES = [
  { code: '+1', label: '+1 US/CA' },
  { code: '+44', label: '+44 UK' },
  { code: '+61', label: '+61 AU' },
  { code: '+91', label: '+91 IN' },
  { code: '+52', label: '+52 MX' },
]

function formatLocal(value: string, code: string): string {
  const digits = value.replace(/\D/g, '').slice(0, code === '+1' ? 10 : 15)
  if (code !== '+1') return digits
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function Services() {
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
    if (!form.propertyAddress.trim()) {
      showErrorToast('Property address is required.')
      return
    }
    if (!form.nameAndRole.trim()) {
      showErrorToast('Your name and role are required.')
      return
    }
    if (!form.phone.trim()) {
      showErrorToast('Callback number is required.')
      return
    }
    if (!form.lossType.trim()) {
      showErrorToast('Type of loss is required.')
      return
    }

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
      setForm({
        propertyAddress: '',
        nameAndRole: '',
        countryCode: '+1',
        phone: '',
        lossType: '',
        unitsAffected: '',
      })
      setSeverity('Moderate')
    } catch {
      showErrorToast('Failed to submit. Please call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2a2a2a] text-white">
      <div className="max-w-[480px] mx-auto px-4 py-6 flex flex-col gap-5">
        {/* ── Red Emergency Header ── */}
        <div className="bg-[#dc2626] rounded-xl p-5 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-white" />
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-white/90">
              Water Loss Emergency
            </span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight tracking-tight">
            We&apos;re available 24/7
          </h1>
          <p className="text-sm text-white/90 mt-1.5 font-medium">
            Call now or submit below — we respond same day
          </p>
        </div>

        {/* ── Phone Card ── */}
        <a
          href="tel:800-555-XXXX"
          className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-md active:scale-[0.99] transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-[#dc2626] flex items-center justify-center shrink-0">
            <Phone size={22} className="text-white" />
          </div>
          <div>
            <div className="text-[#1a1a1a] font-bold text-base">
              (800) 555-XXXX — tap to call
            </div>
            <div className="text-[#666] text-xs font-medium mt-0.5">
              Direct line to our emergency dispatch team
            </div>
          </div>
        </a>

        {/* ── While You Wait Steps ── */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-white/60 mb-3">
            While you wait — do this now
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                num: '1',
                text: 'Shut off the water source if safe to do so — main valve or unit shutoff',
              },
              {
                num: '2',
                text: 'Document with photos and video before touching anything — this protects your records and supports scope documentation',
              },
              {
                num: '3',
                text: 'Do not run fans or move standing water — improper drying can spread mold within 24–48 hrs',
              },
              {
                num: '4',
                text: 'Limit resident access to affected areas until our team assesses the scope',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-[#3d3d3d] rounded-xl p-4 flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-[#ff6b7a]/20 text-[#ff6b7a] flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {step.num}
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Submit Loss Report Form ── */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-white/60 mb-3">
            Submit a loss report
          </h2>
          <div className="bg-[#3d3d3d] rounded-xl p-5 flex flex-col gap-4 shadow-inner">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Property address <span className="text-[#ff6b7a]">*</span>
              </label>
              <input
                type="text"
                value={form.propertyAddress}
                onChange={(e) => setField('propertyAddress', e.target.value)}
                placeholder="123 Main St, Unit 4B"
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Your name and role <span className="text-[#ff6b7a]">*</span>
              </label>
              <input
                type="text"
                value={form.nameAndRole}
                onChange={(e) => setField('nameAndRole', e.target.value)}
                placeholder="Jane Smith — Property Manager"
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Best callback number <span className="text-[#ff6b7a]">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => {
                    setField('countryCode', e.target.value)
                    setField('phone', '')
                  }}
                  className="bg-[#555] rounded-xl px-3 py-2.5 text-sm text-white/90 outline-none focus:ring-2 focus:ring-[#dc2626]/50 shrink-0"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setField('phone', formatLocal(e.target.value, form.countryCode))
                  }
                  placeholder={form.countryCode === '+1' ? '(555) 000-0000' : 'Phone number'}
                  className="flex-1 bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Type of loss <span className="text-[#ff6b7a]">*</span>
              </label>
              <input
                type="text"
                value={form.lossType}
                onChange={(e) => setField('lossType', e.target.value)}
                placeholder="Burst pipe / flooding / sewage / other"
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                How many units affected?
              </label>
              <input
                type="text"
                value={form.unitsAffected}
                onChange={(e) => setField('unitsAffected', e.target.value)}
                placeholder="e.g. 3 units, 1 floor"
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Severity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Minor', 'Moderate', 'Severe'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`rounded-xl py-2.5 text-sm font-bold transition-all ${
                      severity === level
                        ? 'bg-[#ff6b7a]/20 text-[#ff6b7a] ring-1 ring-[#ff6b7a]/50'
                        : 'bg-[#555] text-white/60 hover:text-white/90'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-white text-[#1a1a1a] rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/95 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit loss report'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </div>
          <div className="flex justify-center mt-3">
            <ChevronDown size={20} className="text-white/40" />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center text-xs text-white/40 font-medium pb-4">
          Your company name · Licensed &amp; Insured · CSLB #XXXXXX
        </div>
      </div>
    </div>
  )
}
