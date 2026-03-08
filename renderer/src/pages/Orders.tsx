import { Button } from "@mantine/core"
import { useOrderStore } from "../store/orderStore"

export default function Orders() {
  const { items, addItem } = useOrderStore()

  return (
    <div className="space-y-4">

      <h1 className="text-2xl font-bold">Create Order</h1>

      <Button
        onClick={() =>
          addItem({
            name: "Shirt",
            price: 500,
          })
        }
      >
        Add Shirt
      </Button>

      <div className="bg-white p-4 rounded shadow">

        <h2 className="font-semibold mb-2">Order Items</h2>

        {items.map((item, index) => (
          <p key={index}>
            {item.name} - ₦{item.price}
          </p>
        ))}

      </div>
    </div>
  )
}