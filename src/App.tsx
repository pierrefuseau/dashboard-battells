import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Overview from '@/pages/Overview'
import Videos from '@/pages/Videos'
import Import from '@/pages/Import'
import Planner from '@/pages/Planner'
import Sponsors from '@/pages/Sponsors'
import Simulator from '@/pages/Simulator'
import Advisor from '@/pages/Advisor'
import Platforms from '@/pages/Platforms'
import Quadrant from '@/pages/Quadrant'
import Trends from '@/pages/Trends'
import Ideas from '@/pages/Ideas'

export default function App() {
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="flex-1 ml-[var(--spacing-sidebar)]">
        <Header />
        <main className="px-8 py-6">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/import" element={<Import />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/simulateur" element={<Simulator />} />
              <Route path="/advisor" element={<Advisor />} />
              <Route path="/plateformes" element={<Platforms />} />
              <Route path="/quadrant" element={<Quadrant />} />
              <Route path="/tendances" element={<Trends />} />
              <Route path="/idees" element={<Ideas />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
