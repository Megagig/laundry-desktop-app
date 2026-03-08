import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
  addCustomer: (customer: unknown) => ipcRenderer.invoke("add-customer", customer),
  getCustomers: () => ipcRenderer.invoke("get-customers"),
  getServices: () => ipcRenderer.invoke("get-services")
})