import { create } from "zustand"

interface OrderItem {
  name: string
  price: number
}

interface OrderState {
  items: OrderItem[]
  addItem: (item: OrderItem) => void
  clearItems: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  clearItems: () =>
    set({
      items: [],
    }),
}))