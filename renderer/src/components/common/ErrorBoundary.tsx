import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { Container, Title, Text, Button, Paper } from "@mantine/core"
import { IconAlertTriangle } from "@tabler/icons-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" style={{ marginTop: "100px" }}>
          <Paper p="xl" withBorder>
            <div style={{ textAlign: "center" }}>
              <IconAlertTriangle size={64} color="red" style={{ marginBottom: "20px" }} />
              <Title order={2} mb="md">
                Oops! Something went wrong
              </Title>
              <Text c="dimmed" mb="xl">
                The application encountered an unexpected error. Please try restarting the app.
              </Text>

              {this.state.error && (
                <Paper p="md" mb="xl" style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
                  <Text size="sm" fw={600} mb="xs">
                    Error Details:
                  </Text>
                  <Text size="xs" c="red" style={{ fontFamily: "monospace" }}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text size="xs" c="dimmed" mt="xs" style={{ fontFamily: "monospace" }}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </Paper>
              )}

              <Button onClick={this.handleReset} size="lg">
                Return to Dashboard
              </Button>
            </div>
          </Paper>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
