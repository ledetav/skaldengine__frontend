import Navbar from '@/components/ui/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'
import Footer from '@/components/ui/Footer'

/**
 * Главный лендинг-экран платформы SkaldEngine с промо-секциями, описанием возможностей и подвалом.
 */
export default function LandingScreen() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  )
}
