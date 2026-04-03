import './index.css'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'
import Footer from './components/Footer'

export default function App() {
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
