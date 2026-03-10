import { ipcMain } from "electron"
import { receiptPrinter } from "../printers/receiptPrinter.js"
import { orderService } from "../services/order.service.js"
import { getSettingByKey } from "../services/settings.service.js"

// Flag to prevent repeated printer initialization attempts
let printerInitialized = false
let printerError: string | null = null

/**
 * Initialize printer with error handling
 */
async function initializePrinter() {
  if (printerInitialized) {
    return { success: !printerError, error: printerError }
  }

  try {
    const printers = await receiptPrinter.getAvailablePrinters()
    printerInitialized = true
    printerError = null
    console.log(`✓ Printer system initialized. Found ${printers.length} printer(s)`)
    return { success: true, printers }
  } catch (error: any) {
    printerError = error.message
    printerInitialized = true
    console.warn(`⚠ Printer system unavailable: ${error.message}`)
    return { success: false, error: error.message }
  }
}

/**
 * Get available printers
 */
ipcMain.handle("printer:get-printers", async () => {
  try {
    const initResult = await initializePrinter()
    if (!initResult.success) {
      return { success: false, error: initResult.error || "Printer system unavailable" }
    }

    const printers = await receiptPrinter.getAvailablePrinters()
    return { success: true, data: printers }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Set default printer
 */
ipcMain.handle("printer:set-default", async (_event, printerName: string) => {
  try {
    receiptPrinter.setDefaultPrinter(printerName)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Get default printer
 */
ipcMain.handle("printer:get-default", async () => {
  try {
    const defaultPrinter = receiptPrinter.getDefaultPrinter()
    return { success: true, data: defaultPrinter }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Print order receipt
 */
ipcMain.handle("printer:print-order-receipt", async (_event, orderId: number, options?: any) => {
  try {
    // Get order details
    const order = await orderService.getOrderWithDetails(orderId)
    if (!order) {
      return { success: false, error: "Order not found" }
    }

    // Get shop settings
    const shopName = await getSettingByKey("shop_name") || "LaundryOS"
    const shopAddress = await getSettingByKey("shop_address") || ""
    const shopPhone = await getSettingByKey("shop_phone") || ""
    const footerMessage = await getSettingByKey("receipt_footer") || "Thank you for your business!"

    // Prepare receipt data
    const receiptData = {
      shopName,
      shopAddress,
      shopPhone,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      items: order.items.map((item: any) => ({
        service_name: item.service_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount: order.total_amount,
      amountPaid: order.amount_paid,
      balance: order.balance,
      pickupDate: new Date(order.pickup_date).toLocaleDateString(),
      orderDate: new Date(order.created_at).toLocaleDateString(),
      notes: order.notes || undefined,
      footerMessage
    }

    // Print receipt
    const result = await receiptPrinter.printOrderReceipt(receiptData, options)
    return result
  } catch (error: any) {
    console.error("Error printing order receipt:", error)
    return { success: false, error: error.message }
  }
})

/**
 * Print payment receipt
 */
ipcMain.handle("printer:print-payment-receipt", async (_event, data: any, options?: any) => {
  try {
    // Get shop settings
    const shopName = await getSettingByKey("shop_name") || "LaundryOS"
    const shopAddress = await getSettingByKey("shop_address") || ""
    const shopPhone = await getSettingByKey("shop_phone") || ""
    const footerMessage = await getSettingByKey("receipt_footer") || "Thank you for your payment!"

    // Prepare payment receipt data
    const receiptData = {
      shopName,
      shopAddress,
      shopPhone,
      orderNumber: data.orderNumber,
      customerName: data.customerName,
      paymentAmount: data.paymentAmount,
      paymentMethod: data.paymentMethod,
      paymentDate: new Date().toLocaleDateString(),
      previousBalance: data.previousBalance,
      newBalance: data.newBalance,
      footerMessage
    }

    // Print receipt
    const result = await receiptPrinter.printPaymentReceipt(receiptData, options)
    return result
  } catch (error: any) {
    console.error("Error printing payment receipt:", error)
    return { success: false, error: error.message }
  }
})

/**
 * Test print
 */
ipcMain.handle("printer:test-print", async (_event, printerName?: string) => {
  try {
    const testData = {
      shopName: "LaundryOS Test",
      shopAddress: "123 Test Street",
      shopPhone: "0800-TEST-PRINT",
      orderNumber: "TEST-001",
      customerName: "Test Customer",
      customerPhone: "0800-000-000",
      items: [
        {
          service_name: "Test Service",
          quantity: 1,
          price: 1000,
          subtotal: 1000
        }
      ],
      totalAmount: 1000,
      amountPaid: 1000,
      balance: 0,
      pickupDate: new Date().toLocaleDateString(),
      orderDate: new Date().toLocaleDateString(),
      footerMessage: "This is a test print"
    }

    const result = await receiptPrinter.printOrderReceipt(testData, {
      printerName,
      preview: true
    })
    return result
  } catch (error: any) {
    console.error("Error test printing:", error)
    return { success: false, error: error.message }
  }
})
