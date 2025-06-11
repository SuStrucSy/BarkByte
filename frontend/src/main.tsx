import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"
import './index.css'
import { api } from '@/lib/api'
import { pluginToken } from '@zodios/plugins';
import { AxiosError } from 'axios'

api.use(pluginToken({
  getToken: async () => localStorage.getItem("access_token") || ""
}))

const handleApiError = (error: Error) => {
  if (error instanceof AxiosError) {
    // Access the status code safely
    const status = error.response ? error.response.status : undefined;
    if (status !== undefined && [401, 403].includes(status)) {
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}


ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
