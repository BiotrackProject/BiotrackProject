import { useTranslation } from 'react-i18next'
import isotipoGris from '../../assets/images/isotipogris.png'

export default function ReportSidebar() {
  const { t } = useTranslation()

  const GUIDE = [
    { label: t('reportSidebar.required'), field: t('reportSidebar.fieldLocation') },
    { label: t('reportSidebar.recommended'), field: t('reportSidebar.fieldEvidence') },
    { label: t('reportSidebar.optional'), field: t('reportSidebar.fieldContact') },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Guía rápida */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-black text-primary">{t('reportSidebar.guideTitle')}</h3>

        <div className="flex flex-col gap-3">
          {GUIDE.map(({ label, field }) => (
            <div key={field} className="rounded-xl bg-surface p-4">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-bold text-primary">{field}</p>
            </div>
          ))}
        </div>

        {/* Protección de datos */}
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="mb-1 text-sm font-bold text-action">
            {t('reportSidebar.dataProtectionTitle')}
          </p>
          <p className="text-xs leading-relaxed text-gray-600">
            {t('reportSidebar.dataProtectionDesc')}
          </p>
        </div>
      </div>

      {/* Estado del reporte */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-black text-primary">{t('reportSidebar.statusTitle')}</h3>
        <p className="text-xs leading-relaxed text-gray-500">
          {t('reportSidebar.statusDesc')}
        </p>
      </div>

      {/* Watermark */}
      <div className="flex justify-center py-2 opacity-20">
        <img src={isotipoGris} alt="" className="w-36" />
      </div>
    </div>
  )
}
