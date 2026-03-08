export {}

declare global {
  interface Window {
    api: {
      addCustomer: (customer: any) => Promise<any>
      getCustomers: () => Promise<any>
    }
  }
}