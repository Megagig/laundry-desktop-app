import { Loader } from "@mantine/core"

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Loading...",
  fullScreen = false 
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader size={size} />
          {text && <p className="text-gray-600">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader size={size} />
        {text && <p className="text-gray-600 text-sm">{text}</p>}
      </div>
    </div>
  )
}
