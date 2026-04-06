import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global/index.css'
import LandingScreen from './screens/Landing/LandingScreen'
import AuthScreen from './screens/Auth/AuthScreen'
import DashboardScreen from './screens/Dashboard/DashboardScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<AuthScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
      </Routes>
    </BrowserRouter>
  )
}
