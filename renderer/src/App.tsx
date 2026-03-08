import { Button } from "@mantine/core"

function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg space-y-4">
        <h1 className="text-3xl font-bold">
          Laundry Manager
        </h1>

        <Button color="blue">
          Create Order
        </Button>
      </div>
    </div>
  )
}

export default App