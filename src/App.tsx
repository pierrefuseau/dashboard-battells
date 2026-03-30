import { useState, useCallback, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Overview from '@/pages/Overview'
import Videos from '@/pages/Videos'
import Import from '@/pages/Import'
import Simulator from '@/pages/Simulator'
import Quadrant from '@/pages/Quadrant'
import Growth from '@/pages/Growth'
import Audience from '@/pages/Audience'
import Traffic from '@/pages/Traffic'
import Calendar from '@/pages/Calendar'
import Ideas from '@/pages/Ideas'
import Labo from '@/pages/Labo'
import Thumbnails from '@/pages/Thumbnails'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex min-h-screen bg-page">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={closeSidebar} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 ml-0 lg:ml-[var(--spacing-sidebar)] min-w-0">
        <Header onMenuToggle={toggleSidebar} />
        <main className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/quadrant" element={<Quadrant />} />
              <Route path="/croissance" element={<Growth />} />
              <Route path="/audience" element={<Audience />} />
              <Route path="/trafic" element={<Traffic />} />
              <Route path="/calendrier" element={<Calendar />} />
              <Route path="/simulateur" element={<Simulator />} />
              <Route path="/import" element={<Import />} />
              <Route path="/idees" element={<Ideas />} />
              <Route path="/labo" element={<Labo />} />
              <Route path="/miniatures" element={<Thumbnails />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
