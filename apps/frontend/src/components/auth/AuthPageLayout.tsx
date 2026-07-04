import type { ReactNode } from 'react'
import ImagePanel from './ImagePanel'

interface AuthPageLayoutProps {
  imageSrc: string
  mobileTag: string
  children: ReactNode
}

/**
 * Shared layout for all auth pages: mobile top banner + form column + image panel.
 */
export default function AuthPageLayout({ imageSrc, mobileTag, children }: Readonly<AuthPageLayoutProps>) {
  return (
    <div className="min-h-screen bg-[#eceff3]">
      <div className="grid min-h-screen md:grid-cols-[0.95fr_1.05fr]">
        {/* Mobile top image strip */}
        <div
          className="relative h-32 w-full overflow-hidden md:hidden"
          style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(19,53,108,0.74),rgba(40,40,40,0.64))]" />
          <div className="absolute left-6 top-6 border-l-2 border-secondary/80 pl-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-surface/90">
            {mobileTag}
          </div>
        </div>

        {/* Form column */}
        <div className="relative flex w-full items-center px-6 py-8 sm:px-10 md:px-12 lg:px-16">
          <div className="pointer-events-none absolute left-5 top-5 h-14 w-14 border-l-2 border-t-2 border-primary/25" />
          <div className="w-full max-w-[460px]">
            {children}
          </div>
        </div>

        {/* Desktop image panel */}
        <ImagePanel
          imageSrc={imageSrc}
          className="hidden md:flex"
          overlayClassName="bg-[linear-gradient(145deg,rgba(19,53,108,0.76),rgba(40,40,40,0.64))]"
          logo="isotipo"
          logoClassName="w-[260px]"
        />
      </div>
    </div>
  )
}
