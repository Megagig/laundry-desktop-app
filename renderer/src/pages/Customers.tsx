import { useEffect, useState } from "react"
import { Button, TextInput } from "@mantine/core"

export default function Customers() {

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [customers, setCustomers] = useState<any[]>([])

  const loadCustomers = async () => {
    const result = await window.api.customer.getAll()
    if (result.success) {
      setCustomers(result.data)
    }
  }

  const createCustomer = async () => {
    const result = await window.api.customer.create({ name, phone })
    if (result.success) {
      setName("")
      setPhone("")
      loadCustomers()
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="bg-white p-4 rounded shadow space-y-3">

        <TextInput
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextInput
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Button onClick={createCustomer}>
          Add Customer
        </Button>

      </div>

      <div className="bg-white p-4 rounded shadow">

        <h2 className="font-semibold mb-3">Customer List</h2>

        {customers.map((c) => (
          <p key={c.id}>
            {c.name} — {c.phone}
          </p>
        ))}

      </div>

    </div>
  )
}