import { useState, useEffect, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Copy, Download, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/ui/toast/toastConfig";
import { ROUTES } from "@/lib/routes";

/* ── Types ── */
interface Setting {
  key: string;
  value: string;
}

interface FormFields {
  notification_email: string;
  company_name: string;
  calendar_title: string;
}

interface AggregateCounts {
  crews: number;
  slots: number;
  bookings: number;
  properties: number;
}

/* ── Known setting keys ── */
const SETTING_KEYS = [
  "notification_email",
  "company_name",
  "calendar_title",
] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

const FIELD_LABELS: Record<SettingKey, string> = {
  notification_email: "Notification Email",
  company_name: "Company Name",
  calendar_title: "Calendar Title",
};

const FIELD_PLACEHOLDERS: Record<SettingKey, string> = {
  notification_email: "admin@example.com",
  company_name: "Reliance Building Services",
  calendar_title: "Irvine Scheduling",
};

/* ── Component ── */
export function SettingsPanel() {
  const [fields, setFields] = useState<FormFields>({
    notification_email: "",
    company_name: "",
    calendar_title: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [counts, setCounts] = useState<AggregateCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);

  const [copied, setCopied] = useState(false);
  const pngRef = useRef<HTMLCanvasElement | null>(null);
  const stableUrl = `${window.location.origin}${ROUTES.QR_EMERGENCY}`;

  /* ── Initial load: settings + counts ── */
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("key, value");

        if (cancelled) return;
        if (error) throw error;

        const map = new Map<string, string>();
        (data as Setting[] | null)?.forEach((s) => map.set(s.key, s.value));

        setFields({
          notification_email: map.get("notification_email") ?? "",
          company_name: map.get("company_name") ?? "",
          calendar_title: map.get("calendar_title") ?? "",
        });

      } catch (e) {
        if (cancelled) return;
        showErrorToast(
          e instanceof Error ? e.message : "Failed to load settings",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadCounts() {
      try {
        const [crewsRes, slotsRes, propertiesRes] = await Promise.all([
          supabase.from("crews").select("*", { count: "exact", head: true }),
          supabase.from("slots").select("*", { count: "exact", head: true }),
          supabase
            .from("properties")
            .select("*", { count: "exact", head: true }),
        ]);

        const bookingsRes = await supabase
          .from("slots")
          .select("*", { count: "exact", head: true })
          .not("booked_by_name", "is", null);

        if (cancelled) return;

        setCounts({
          crews: crewsRes.count ?? 0,
          slots: slotsRes.count ?? 0,
          bookings: bookingsRes.count ?? 0,
          properties: propertiesRes.count ?? 0,
        });
      } catch {
        if (!cancelled) setCounts(null);
      } finally {
        if (!cancelled) setCountsLoading(false);
      }
    }

    loadSettings();
    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── QR helpers ── */
  function downloadSvg() {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "emergency-qr.svg";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    const canvas = pngRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "emergency-qr.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  function copyUrl() {
    navigator.clipboard.writeText(stableUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  /* ── Save ── */
  async function handleSave() {
    setSaving(true);
    try {
      const upserts = (Object.entries(fields) as [SettingKey, string][]).map(
        ([key, value]) =>
          supabase
            .from("settings")
            .upsert({ key, value: value.trim() }, { onConflict: "key" }),
      );

      const results = await Promise.all(upserts);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;

      showSuccessToast("Settings saved");
    } catch (e) {
      showErrorToast(
        e instanceof Error ? e.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ── Render ── */
  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          <Skeleton className="w-24 h-6" />
        </h2>
        <div className="bg-surface-default rounded-lg border border-border p-4 sm:p-5 shadow-sm mb-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="w-40 h-4 mb-2" />
              <Skeleton className="w-full h-9" />
            </div>
          ))}
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          <Skeleton className="w-20 h-5" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-default rounded-lg border border-border p-4 shadow-sm"
            >
              <Skeleton className="w-16 h-8 mx-auto mb-1" />
              <Skeleton className="w-12 h-3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Settings Form ── */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">Settings</h2>

      <div className="bg-surface-default rounded-lg border border-border p-4 sm:p-5 shadow-sm mb-6">
        {SETTING_KEYS.map((key) => (
          <Input
            key={key}
            label={FIELD_LABELS[key]}
            placeholder={FIELD_PLACEHOLDERS[key]}
            value={fields[key]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFields({ ...fields, [key]: e.target.value })
            }
          />
        ))}

        <div className="flex justify-end pt-1">
          <Button loading={saving} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>

      {/* ── QR Code Manager ── */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Emergency QR Code
      </h2>

      <div className="bg-surface-default rounded-lg border border-border p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* QR preview (SVG — vector, for display) */}
          <div className="shrink-0 p-3 bg-white rounded-lg shadow-sm">
            <QRCodeSVG
              id="qr-svg"
              value={stableUrl}
              size={160}
              level="H"
              includeMargin={false}
            />
            {/* Hidden high-res canvas for PNG export */}
            <div className="hidden">
              <QRCodeCanvas
                ref={pngRef}
                value={stableUrl}
                size={2048}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Stable URL + actions */}
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Printed on cards — never changes
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-mono text-text-primary bg-surface rounded px-2 py-1 border border-border break-all">
                  {stableUrl}
                </code>
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1 text-xs text-text-secondary hover:text-brand transition-colors shrink-0"
                >
                  {copied ? (
                    <Check size={13} className="text-green-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={downloadSvg}
                className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded px-3 py-1.5 hover:bg-surface-hover transition-colors"
              >
                <Download size={13} />
                Download SVG
              </button>
              <button
                onClick={downloadPng}
                className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded px-3 py-1.5 hover:bg-surface-hover transition-colors"
              >
                <Download size={13} />
                Download PNG (2048px)
              </button>
            </div>

            {/* Destination note */}
            <div className="bg-surface rounded-lg border border-border px-4 py-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Destination</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Controlled by <code className="text-text-primary">ROUTES.EMERGENCY</code> in{' '}
                <code className="text-text-primary">src/lib/routes.ts</code>. To move the page,
                update that constant and add a redirect for the old path in{' '}
                <code className="text-text-primary">router.tsx</code> — the QR URL on printed
                cards never needs to change.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Section ── */}
      <h3 className="text-base font-semibold text-text-primary mb-3">Stats</h3>

      {countsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-default rounded-lg border border-border p-4 shadow-sm text-center"
            >
              <Skeleton className="w-16 h-8 mx-auto mb-1" />
              <Skeleton className="w-12 h-3 mx-auto" />
            </div>
          ))}
        </div>
      ) : counts ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { label: "Crews", value: counts.crews },
              { label: "Slots Total", value: counts.slots },
              { label: "Bookings", value: counts.bookings },
              { label: "Properties", value: counts.properties },
            ] as const
          ).map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-default rounded-lg border border-border p-4 shadow-sm text-center"
            >
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Unable to load stats.</p>
      )}
    </div>
  );
}
