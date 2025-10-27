import './App.css'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './components/common/theme-provider'
// ▼▼▼ 1. IMPORT "สมอง" เข้ามา ▼▼▼
import { AuthProvider } from './contexts/AuthContext'
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider >
  )
}

export default App
