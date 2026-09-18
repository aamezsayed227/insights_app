import { Route, Routes } from 'react-router'
import { OfflineDemoPage } from './offline-demo'

function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground text-sm">Insight — base app running.</p>
    </main>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/offline-demo" element={<OfflineDemoPage />} />
    </Routes>
  )
}
