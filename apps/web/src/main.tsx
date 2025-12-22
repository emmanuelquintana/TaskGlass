import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import './app.css'
import { AppearanceProvider } from './components/providers/AppearanceProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppearanceProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppearanceProvider>
  </QueryClientProvider>
)
