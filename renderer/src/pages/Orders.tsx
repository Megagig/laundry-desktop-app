import { useEffect, useState } from "react"
import { Button } from "@mantine/core"

export default function Orders() {

  const [services, setServices] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {

    const loadServices = async () => {
      const result = await window.api.service.getAll()
      if (result.success) {
        setServices(result.data)
      }
    }

    loadServices()

  }, [])

  const addToCart = (service:any) => {

    setCart([...cart, service])

  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Create Order</h1>

      <div className="grid grid-cols-3 gap-4">

        {services.map((s)=> (

          <Button
            key={s.id}
            onClick={()=>addToCart(s)}
          >
            {s.name} ₦{s.price}
          </Button>

        ))}

      </div>

      <div className="bg-white p-4 rounded shadow">

        <h2 className="font-semibold">Cart</h2>

        {cart.map((item,index)=>(
          <p key={index}>
            {item.name} - ₦{item.price}
          </p>
        ))}

        <h3 className="font-bold mt-3">
          Total: ₦{total}
        </h3>

      </div>

    </div>

  )
}