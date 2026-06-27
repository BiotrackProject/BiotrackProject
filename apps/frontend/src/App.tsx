import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import router from './routes'

const queryClient = new QueryClient();

export default function App() {
  return (

    <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
    </AuthProvider>
  )
}
