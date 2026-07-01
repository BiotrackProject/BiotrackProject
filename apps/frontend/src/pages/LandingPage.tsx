import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/landing/HeroSection'
import PurposeSection from '../components/landing/PurposeSection'
import ActionCardsSection from '../components/landing/ActionCardsSection'
import ImpactStoriesSection from '../components/landing/ImpactStoriesSection'
import ProcessTrustSection from '../components/landing/ProcessTrustSection'
import StatsSection from '../components/landing/StatsSection'
import NewsCarousel from '../components/landing/NewsCarousel'
import InfoLinksSection from '../components/landing/InfoLinksSection'
import FaqSection from '../components/landing/FaqSection'
import HelpSection from '../components/landing/HelpSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PurposeSection />
        <ActionCardsSection />
        <ImpactStoriesSection />
        <ProcessTrustSection />
        <StatsSection />
        <NewsCarousel />
        <FaqSection />
        <HelpSection />
        <InfoLinksSection />
      </main>
      <Footer />
    </div>
  )
}
