import type { TFunction } from 'i18next'

type TourStep = { element: string | null; title: string; intro: string; position?: string }

export function getLandingTourSteps(t: TFunction): TourStep[] {
  return [
    { element: '[data-tour="landing-navbar"]', title: t('tour.landing.navTitle'), intro: t('tour.landing.navIntro'), position: 'bottom' },
    { element: '[data-tour="landing-hero"]', title: t('tour.landing.heroTitle'), intro: t('tour.landing.heroIntro'), position: 'bottom' },
    { element: '[data-tour="landing-purpose"]', title: t('tour.landing.purposeTitle'), intro: t('tour.landing.purposeIntro'), position: 'top' },
    { element: '[data-tour="landing-action-cards"]', title: t('tour.landing.actionTitle'), intro: t('tour.landing.actionIntro'), position: 'top' },
    { element: '[data-tour="landing-stats"]', title: t('tour.landing.statsTitle'), intro: t('tour.landing.statsIntro'), position: 'top' },
    { element: '[data-tour="landing-news"]', title: t('tour.landing.newsTitle'), intro: t('tour.landing.newsIntro'), position: 'top' },
    { element: '[data-tour="landing-help"]', title: t('tour.landing.helpTitle'), intro: t('tour.landing.helpIntro'), position: 'top' },
    { element: '[data-tour="landing-tour-btn"]', title: t('tour.landing.repeatTitle'), intro: t('tour.landing.repeatIntro'), position: 'left' },
  ]
}

export function getCitizenTourSteps(t: TFunction): TourStep[] {
  return [
    { element: '[data-tour="citizen-navbar"]', title: t('tour.citizen.navTitle'), intro: t('tour.citizen.navIntro'), position: 'bottom' },
    { element: '[data-tour="citizen-report-intro"]', title: t('tour.citizen.reportTitle'), intro: t('tour.citizen.reportIntro'), position: 'bottom' },
    { element: '[data-tour="citizen-report-form"]', title: t('tour.citizen.formTitle'), intro: t('tour.citizen.formIntro'), position: 'left' },
    { element: '[data-tour="citizen-report-sidebar"]', title: t('tour.citizen.sidebarTitle'), intro: t('tour.citizen.sidebarIntro'), position: 'left' },
    { element: '[data-tour="citizen-tour-btn"]', title: t('tour.citizen.readyTitle'), intro: t('tour.citizen.readyIntro'), position: 'left' },
  ]
}

export function getCitizenSearchTourSteps(t: TFunction): TourStep[] {
  return [
    { element: '[data-tour="citizen-navbar"]', title: t('tour.citizenSearch.navTitle'), intro: t('tour.citizenSearch.navIntro'), position: 'bottom' },
    { element: '[data-tour="citizen-search-area"]', title: t('tour.citizenSearch.searchTitle'), intro: t('tour.citizenSearch.searchIntro'), position: 'bottom' },
    { element: '[data-tour="citizen-tour-btn"]', title: t('tour.citizenSearch.helpTitle'), intro: t('tour.citizenSearch.helpIntro'), position: 'left' },
  ]
}

function baseBackofficeSteps(t: TFunction, title: string, intro: string): TourStep[] {
  return [
    { element: null, title, intro },
    { element: '[data-tour="backoffice-sidebar"]', title: t('tour.backoffice.sidebarTitle'), intro: t('tour.backoffice.sidebarIntro'), position: 'right' },
    { element: '[data-tour="backoffice-topbar-actions"]', title: t('tour.backoffice.actionsTitle'), intro: t('tour.backoffice.actionsIntro'), position: 'bottom' },
    { element: '[data-tour="backoffice-help-btn"]', title: t('tour.backoffice.repeatTitle'), intro: t('tour.backoffice.repeatIntro'), position: 'left' },
  ]
}

export function getBackofficeTourSteps(t: TFunction, section?: string): TourStep[] {
  return baseBackofficeSteps(
    t,
    t('tour.backoffice.welcomeTitle'),
    t('tour.backoffice.welcomeIntro'),
  )
}

// Legacy named exports for backwards compatibility — kept as constants
// so existing imports don't break, but consumers should migrate to the functions above.
export const LANDING_TOUR_STEPS: TourStep[] = []
export const CITIZEN_TOUR_STEPS: TourStep[] = []
export const CITIZEN_SEARCH_TOUR_STEPS: TourStep[] = []
