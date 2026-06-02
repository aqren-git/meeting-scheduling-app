import { useState } from 'react'
import { AlertTriangle, Phone, ArrowRight, ChevronDown } from 'lucide-react'

export default function Services() {
  const [severity, setSeverity] = useState<'Minor' | 'Moderate' | 'Severe'>('Moderate')

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
                Property address
              </label>
              <input
                type="text"
                defaultValue="123 Main St, Unit 4B"
                readOnly
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Your name and role
              </label>
              <input
                type="text"
                defaultValue="Jane Smith — Property Manager"
                readOnly
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Best callback number
              </label>
              <input
                type="text"
                defaultValue="(714) 555-0000"
                readOnly
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                Type of loss
              </label>
              <input
                type="text"
                defaultValue="Burst pipe / flooding / sewage / other"
                readOnly
                className="bg-[#555] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#dc2626]/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                How many units affected?
              </label>
              <input
                type="text"
                defaultValue="e.g. 3 units, 1 floor"
                readOnly
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
              className="w-full bg-white text-[#1a1a1a] rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/95 active:scale-[0.99] transition-all"
            >
              Submit loss report
              <ArrowRight size={16} />
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
