import { Navigate, Route, Routes } from 'react-router-dom'
import { ShellLayout } from './components/layout/ShellLayout'
import { BoardPage } from './pages/BoardPage'
import { WorkspacesPage } from './pages/WorkspacesPage'
import { LiquidGlassDefs } from './components/ui/LiquidGlassDefs'

export default function App() {
  return (
    <>
      <LiquidGlassDefs />
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<WorkspacesPage />} />
          <Route path="/w/:workspaceId/board" element={<BoardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
