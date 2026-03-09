// Helper to serialize data for IPC (converts Dates to strings, handles BigInt, etc.)
export function serializeForIPC(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ))
}
