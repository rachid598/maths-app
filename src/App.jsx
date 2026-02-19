import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Portal = lazy(() => import('./portal/Portal.jsx'))
const App6e = lazy(() => import('./apps/6e/App6e.jsx'))
const App5e = lazy(() => import('./apps/5e/App5e.jsx'))
const App3e = lazy(() => import('./apps/3e/App3e.jsx'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg text-white">
      <div className="animate-pop-in text-center">
        <div className="text-4xl mb-2">📐</div>
        <p className="text-sm text-slate-400">Chargement…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/6e/*" element={<App6e />} />
        <Route path="/5e/*" element={<App5e />} />
        <Route path="/3e/*" element={<App3e />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
