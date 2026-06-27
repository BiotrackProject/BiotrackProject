// @ts-nocheck
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FileWarning, MapPin, ClipboardCheck, Map } from 'lucide-react'
import BackofficeTopbar from '../../components/backoffice/BackofficeTopbar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { dashboardService, type ImpactoRow, type FrecuenciaRow } from '../../services/dashboardService'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, LabelList,
} from 'recharts'

// ── Chart colors ──────────────────────────────────────────────────────────────

const CHART_COLORS = ['#22C55E', '#3B82F6', '#FBBF24', '#F97316', '#A855F7', '#EF4444', '#06B6D4', '#64748B']

// ── Chart data fallbacks (shown while real data loads or if fetch fails) ──────

const FALLBACK_IMPACT_DATA = [
  { name: 'Degradación ambiental',     value: 40, color: '#22C55E' },
  { name: 'Problemas de salud',         value: 25, color: '#3B82F6' },
  { name: 'Impacto económico',          value: 20, color: '#FBBF24' },
  { name: 'Desplazamiento de familias', value: 10, color: '#F97316' },
  { name: 'Conflictos sociales',        value:  5, color: '#A855F7' },
]

const FALLBACK_FREQUENCY_PAGES = [
  [
    { month: 'Enero',    value: 21 },
    { month: 'Febrero',  value: 19 },
    { month: 'Marzo',    value: 21 },
    { month: 'Abril',    value: 18 },
    { month: 'Mayo',     value: 17 },
  ],
  [
    { month: 'Junio',     value: 16 },
    { month: 'Julio',     value: 20 },
    { month: 'Agosto',    value: 18 },
    { month: 'Septiembre',value: 15 },
    { month: 'Octubre',   value: 17 },
  ],
]

function toImpactData(rows: ImpactoRow[]) {
  const total = rows.reduce((s, r) => s + r.total, 0)
  if (total === 0) return FALLBACK_IMPACT_DATA
  return rows.map((r, i) => ({
    name: r.tipo_actividad.replace(/_/g, ' '),
    value: Math.round((r.total / total) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))
}

function toFrequencyPages(rows: FrecuenciaRow[]) {
  if (!rows.length) return FALLBACK_FREQUENCY_PAGES
  const mapped = rows.map((r) => ({ month: r.mes, value: r.total }))
  const pages: { month: string; value: number }[][] = []
  for (let i = 0; i < mapped.length; i += 5) pages.push(mapped.slice(i, i + 5))
  return pages
}

const ZONES_DATA = [
  { zone: 'Zona Oeste', value: 15000, color: '#3B82F6' },
  { zone: 'Zona Este',  value: 12000, color: '#EF4444' },
  { zone: 'Zona Sur',   value: 10000, color: '#22C55E' },
  { zone: 'Zona Norte', value:  7000, color: '#A855F7' },
]

const VOLUME_DATA = [
  { province: 'Santo Domingo', value: 1950, color: '#3B82F6' },
  { province: 'Bonao',         value: 1550, color: '#EF4444' },
  { province: 'La Romana',     value: 1200, color: '#22C55E' },
  { province: 'Puerto Plata',  value:  880, color: '#FBBF24' },
  { province: 'San Cristóbal', value:  780, color: '#A855F7' },
  { province: 'Santiago',      value:  380, color: '#06B6D4' },
  { province: 'La Vega',       value:   90, color: '#64748B' },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function Card({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border border-[#e6ebf3] bg-white p-6 shadow-[0_8px_24px_rgba(19,53,108,0.06)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-primary leading-snug">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function VerTodasBtn({ onClick }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border border-action px-4 py-1.5 text-xs font-semibold text-action hover:bg-action hover:text-white transition-colors"
    >
      {t('dashboard.viewAll')}
    </button>
  )
}

function ColoredBar(props) {
  const { x, y, width, height, fill } = props
  return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[#e6ebf3] bg-white p-5 shadow-[0_8px_20px_rgba(19,53,108,0.06)] flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-[0_10px_26px_rgba(19,53,108,0.1)] transition-shadow' : ''}`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Chart cards ───────────────────────────────────────────────────────────────

function ImpactDonutCard({ data }) {
  const { t } = useTranslation()
  return (
    <Card title={t('dashboard.impactTitle')}>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex flex-col gap-2">
          {data.map((d) => (
            <li key={d.name} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              {d.name}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function FrequencyLineCard({ pages }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const data = pages[Math.min(page, pages.length - 1)] ?? []
  const peakMonth = data.length ? data.reduce((a, b) => (b.value > a.value ? b : a)).month : ''

  return (
    <Card
      title={t('dashboard.frequencyTitle')}
      subtitle={peakMonth ? t('dashboard.frequencySubtitle', { month: peakMonth }) : undefined}
      action={
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} disabled={page === pages.length - 1} className="p-1 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)', fontSize: 12 }} />
          <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} fill="url(#freqGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

function ZonesBarCard({ onVerTodas }) {
  const { t } = useTranslation()
  return (
    <Card title={t('dashboard.zonesTitle')} subtitle={t('dashboard.zonesSubtitle')} action={<VerTodasBtn onClick={onVerTodas} />}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart layout="vertical" data={ZONES_DATA} margin={{ top: 0, right: 16, bottom: 0, left: 8 }} barSize={28}>
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} domain={[0, 16000]} ticks={[0, 7000, 12000, 15000]} />
          <YAxis type="category" dataKey="zone" tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} width={76} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} shape={(props) => <ColoredBar {...props} fill={ZONES_DATA[props.index]?.color ?? '#3B82F6'} />}>
            <LabelList dataKey="value" position="insideLeft" style={{ fontSize: 12, fontWeight: 600, fill: '#fff' }} formatter={(v) => v.toLocaleString()} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

function VolumeBarCard({ onVerTodas }) {
  const { t } = useTranslation()
  return (
    <Card title={t('dashboard.volumeTitle')} subtitle={t('dashboard.volumeSubtitle')} action={<VerTodasBtn onClick={onVerTodas} />}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart layout="vertical" data={VOLUME_DATA} margin={{ top: 0, right: 16, bottom: 0, left: 8 }} barSize={16}>
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m³`} domain={[0, 2200]} ticks={[0, 500, 900, 1000, 2000]} />
          <YAxis type="category" dataKey="province" tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} width={96} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} shape={(props) => <ColoredBar {...props} fill={VOLUME_DATA[props.index]?.color ?? '#3B82F6'} />} />
          <Tooltip formatter={(v) => [`${v.toLocaleString()} m³`, 'Volumen']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.1)', fontSize: 12 }} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats]                   = useState(null)
  const [loading, setLoading]               = useState(true)
  const [impactData, setImpactData]         = useState(FALLBACK_IMPACT_DATA)
  const [frequencyPages, setFrequencyPages] = useState(FALLBACK_FREQUENCY_PAGES)

  useEffect(() => {
    dashboardService.getStats().then(setStats).finally(() => setLoading(false))
    dashboardService.getImpacto().then((rows) => setImpactData(toImpactData(rows))).catch(() => {})
    dashboardService.getFrecuencia().then((rows) => setFrequencyPages(toFrequencyPages(rows))).catch(() => {})
  }, [])

  return (
    <>
      <BackofficeTopbar title={t('dashboard.title')} />
      <main className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">

        <section className="rounded-2xl border border-primary/10 bg-[linear-gradient(145deg,rgba(19,53,108,0.08),rgba(255,255,255,0.72))] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">{t('dashboard.summaryTag')}</p>
          <p className="mt-2 max-w-[62ch] text-sm leading-6 text-dark/80">
            {t('dashboard.summaryDesc')}
          </p>
        </section>

        {/* KPI summary row */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div data-tour="backoffice-dashboard-stats" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={FileWarning}
              label={t('dashboard.totalDenuncias')}
              value={stats?.totalDenuncias ?? 0}
              color="bg-primary/10 text-primary"
              sub={`${(stats?.por_estado?.Pendiente ?? 0) + (stats?.por_estado?.En_Investigacion ?? 0)} ${t('dashboard.activas')}`}
              onClick={() => navigate('/admin/denuncias')}
            />
            <KpiCard
              icon={FileWarning}
              label={t('dashboard.pendientes')}
              value={stats?.por_estado?.Pendiente ?? 0}
              color="bg-amber-50 text-amber-500"
              sub={t('dashboard.sinAsignar')}
              onClick={() => navigate('/admin/denuncias')}
            />
            <KpiCard
              icon={MapPin}
              label={t('dashboard.enInvestigacion')}
              value={stats?.por_estado?.En_Investigacion ?? 0}
              color="bg-teal-50 text-teal-600"
              sub={`${stats?.por_estado?.Verificada ?? 0} ${t('dashboard.verificadas')}`}
              onClick={() => navigate('/admin/monitoreo')}
            />
            <KpiCard
              icon={ClipboardCheck}
              label={t('dashboard.accionesCompletadas')}
              value={stats?.por_estado_accion?.Completada ?? 0}
              color="bg-emerald-50 text-emerald-600"
              sub={`${stats?.por_estado_accion?.En_Ejecucion ?? 0} ${t('dashboard.enEjecucion')}`}
              onClick={() => navigate('/admin/acciones')}
            />
          </div>
        )}

        {/* Map quick access */}
        <button
          data-tour="backoffice-map-link"
          onClick={() => navigate('/admin/mapa')}
          className="flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/5 px-6 py-4 hover:bg-primary/10 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{t('dashboard.mapTitle')}</p>
              <p className="text-xs text-gray-500">{t('dashboard.mapDesc')}</p>
            </div>
          </div>
          <span className="text-primary text-sm font-semibold shrink-0">{t('dashboard.viewMap')}</span>
        </button>

        {/* Charts */}
        <div data-tour="backoffice-dashboard-charts" className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
          <ImpactDonutCard data={impactData} />
          <FrequencyLineCard pages={frequencyPages} />
          <ZonesBarCard onVerTodas={() => navigate('/admin/monitoreo')} />
          <VolumeBarCard onVerTodas={() => navigate('/admin/denuncias')} />
        </div>
      </main>
    </>
  )
}
