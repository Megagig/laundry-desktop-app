import { notifications } from "@mantine/notifications"
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react"

export const showSuccessNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Success",
    message,
    color: "green",
    icon: <IconCheck size={18} />,
    autoClose: 3000,
  })
}

export const showErrorNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Error",
    message,
    color: "red",
    icon: <IconX size={18} />,
    autoClose: 5000,
  })
}

export const showWarningNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Warning",
    message,
    color: "yellow",
    icon: <IconAlertTriangle size={18} />,
    autoClose: 4000,
  })
}

export const showInfoNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Info",
    message,
    color: "blue",
    icon: <IconInfoCircle size={18} />,
    autoClose: 3000,
  })
}

export const showLoadingNotification = (message: string, id: string) => {
  notifications.show({
    id,
    title: "Loading",
    message,
    loading: true,
    autoClose: false,
    withCloseButton: false,
  })
}

export const updateNotification = (
  id: string,
  message: string,
  type: "success" | "error",
  title?: string
) => {
  notifications.update({
    id,
    title: title || (type === "success" ? "Success" : "Error"),
    message,
    color: type === "success" ? "green" : "red",
    icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
    loading: false,
    autoClose: 3000,
  })
}
