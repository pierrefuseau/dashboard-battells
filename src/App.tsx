import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Overview from '@/pages/Overview'
import Videos from '@/pages/Videos'
import Import from '@/pages/Import'
import Planner from '@/pages/Planner'

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
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
