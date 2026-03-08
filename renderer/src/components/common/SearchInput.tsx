import { TextInput } from "@mantine/core"
import { IconSearch, IconX } from "@tabler/icons-react"
import { useState } from "react"

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
}

export default function SearchInput({ 
  placeholder = "Search...", 
  onSearch,
  debounceMs = 300,
  className = ""
}: SearchInputProps) {
  const [value, setValue] = useState("")
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (newValue: string) => {
    setValue(newValue)

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout for debounced search
    const newTimeoutId = setTimeout(() => {
      onSearch(newValue)
    }, debounceMs)

    setTimeoutId(newTimeoutId)
  }

  const handleClear = () => {
    setValue("")
    onSearch("")
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      leftSection={<IconSearch size={16} />}
      rightSection={
        value ? (
          <IconX 
            size={16} 
            className="cursor-pointer text-gray-400 hover:text-gray-600" 
            onClick={handleClear}
          />
        ) : null
      }
      className={className}
    />
  )
}
