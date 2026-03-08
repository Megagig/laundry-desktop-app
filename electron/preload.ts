import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
  addCustomer: (customer: any) => ipcRenderer.invoke("add-customer", customer),
  getCustomers: () => ipcRenderer.invoke("get-customers")
})