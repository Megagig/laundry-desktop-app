import { Notifications } from "@mantine/notifications"
import AppRouter from "./router/AppRouter"
import ErrorBoundary from "./components/common/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <Notifications position="top-right" zIndex={1000} />
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App