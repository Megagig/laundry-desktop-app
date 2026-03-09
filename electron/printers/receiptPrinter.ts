import { BrowserWindow } from "electron"
const PosPrinter = require("electron-pos-printer")

interface PrinterOptions {
  preview?: boolean
  printerName?: string
  silent?: boolean
}

interface ReceiptData {
  shopName: string
  shopAddress: string
  shopPhone: string
  orderNumber: string
  customerName: string
  customerPhone: string
  items: Array<{
    service_name: string
    quantity: number
    price: number
    subtotal: number
  }>
  totalAmount: number
  amountPaid: number
  balance: number
  pickupDate: string
  orderDate: string
  notes?: string
  footerMessage?: string
}

interface PaymentReceiptData {
  shopName: string
  shopAddress: string
  shopPhone: string
  orderNumber: string
  customerName: string
  paymentAmount: number
  paymentMethod: string
  paymentDate: string
  previousBalance: number
  newBalance: number
  footerMessage?: string
}

export class ReceiptPrinter {
  private defaultPrinter: string | null = null

  /**
   * Get list of available printers
   */
  async getAvailablePrinters(): Promise<string[]> {
    try {
      const { getPrinters } = PosPrinter
      const printers = await getPrinters()
      return printers.map((p: any) => p.name)
    } catch (error) {
      console.error("Error getting printers:", error)
      return []
    }
  }

  /**
   * Set default printer
   */
  setDefaultPrinter(printerName: string) {
    this.defaultPrinter = printerName
  }

  /**
   * Get default printer
   */
  getDefaultPrinter(): string | null {
    return this.defaultPrinter
  }

  /**
   * Print order receipt
   */
  async printOrderReceipt(
    data: ReceiptData,
    options: PrinterOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const printerName = options.printerName || this.defaultPrinter
      
      const receiptData: any[] = [
        {
          type: "text",
          value: data.shopName,
          style: `font-weight: 700; text-align: center; font-size: 18px; margin-top: 10px;`
        },
        {
          type: "text",
          value: data.shopAddress,
          style: `text-align: center; font-size: 12px;`
        },
        {
          type: "text",
          value: `Tel: ${data.shopPhone}`,
          style: `text-align: center; font-size: 12px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: "================================",
          style: `text-align: center;`
        },
        {
          type: "text",
          value: "ORDER RECEIPT",
          style: `font-weight: 700; text-align: center; font-size: 16px; margin-top: 10px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: `Order #: ${data.orderNumber}`,
          style: `font-weight: 600; font-size: 14px;`
        },
        {
          type: "text",
          value: `Date: ${data.orderDate}`,
          style: `font-size: 12px;`
        },
        {
          type: "text",
          value: `Pickup Date: ${data.pickupDate}`,
          style: `font-size: 12px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: "--------------------------------",
          style: `text-align: center;`
        },
        {
          type: "text",
          value: "CUSTOMER DETAILS",
          style: `font-weight: 600; font-size: 13px; margin-top: 10px;`
        },
        {
          type: "text",
          value: `Name: ${data.customerName}`,
          style: `font-size: 12px;`
        },
        {
          type: "text",
          value: `Phone: ${data.customerPhone}`,
          style: `font-size: 12px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: "--------------------------------",
          style: `text-align: center;`
        },
        {
          type: "text",
          value: "ITEMS",
          style: `font-weight: 600; font-size: 13px; margin-top: 10px; margin-bottom: 5px;`
        }
      ]

      // Add items
      data.items.forEach((item) => {
        receiptData.push({
          type: "text",
          value: `${item.service_name} x ${item.quantity}`,
          style: `font-size: 12px;`
        })
        receiptData.push({
          type: "text",
          value: `  ₦${item.price.toLocaleString()} x ${item.quantity} = ₦${item.subtotal.toLocaleString()}`,
          style: `font-size: 11px; margin-bottom: 5px;`
        })
      })

      // Add totals
      receiptData.push(
        {
          type: "text",
          value: "================================",
          style: `text-align: center; margin-top: 10px;`
        },
        {
          type: "text",
          value: `TOTAL AMOUNT: ₦${data.totalAmount.toLocaleString()}`,
          style: `font-weight: 700; font-size: 14px; margin-top: 5px;`
        },
        {
          type: "text",
          value: `Amount Paid: ₦${data.amountPaid.toLocaleString()}`,
          style: `font-size: 13px;`
        },
        {
          type: "text",
          value: `Balance Due: ₦${data.balance.toLocaleString()}`,
          style: `font-size: 13px; font-weight: ${data.balance > 0 ? '700' : '400'}; color: ${data.balance > 0 ? '#d32f2f' : '#2e7d32'}; margin-bottom: 10px;`
        }
      )

      // Add notes if present
      if (data.notes) {
        receiptData.push(
          {
            type: "text",
            value: "--------------------------------",
            style: `text-align: center;`
          },
          {
            type: "text",
            value: "NOTES:",
            style: `font-weight: 600; font-size: 12px; margin-top: 5px;`
          },
          {
            type: "text",
            value: data.notes,
            style: `font-size: 11px; margin-bottom: 10px;`
          }
        )
      }

      // Add footer
      receiptData.push(
        {
          type: "text",
          value: "================================",
          style: `text-align: center; margin-top: 10px;`
        },
        {
          type: "text",
          value: data.footerMessage || "Thank you for your business!",
          style: `text-align: center; font-size: 12px; margin-top: 10px;`
        },
        {
          type: "text",
          value: "Please keep this receipt for collection",
          style: `text-align: center; font-size: 11px; font-style: italic; margin-bottom: 20px;`
        }
      )

      const printOptions: any = {
        preview: options.preview !== undefined ? options.preview : false,
        width: "300px",
        margin: "0 0 0 0",
        copies: 1,
        printerName: printerName,
        timeOutPerLine: 400,
        silent: options.silent !== undefined ? options.silent : true
      }

      await PosPrinter.print(receiptData, printOptions)

      return { success: true }
    } catch (error: any) {
      console.error("Error printing receipt:", error)
      return { 
        success: false, 
        error: error.message || "Failed to print receipt" 
      }
    }
  }

  /**
   * Print payment receipt
   */
  async printPaymentReceipt(
    data: PaymentReceiptData,
    options: PrinterOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const printerName = options.printerName || this.defaultPrinter
      
      const receiptData: any[] = [
        {
          type: "text",
          value: data.shopName,
          style: `font-weight: 700; text-align: center; font-size: 18px; margin-top: 10px;`
        },
        {
          type: "text",
          value: data.shopAddress,
          style: `text-align: center; font-size: 12px;`
        },
        {
          type: "text",
          value: `Tel: ${data.shopPhone}`,
          style: `text-align: center; font-size: 12px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: "================================",
          style: `text-align: center;`
        },
        {
          type: "text",
          value: "PAYMENT RECEIPT",
          style: `font-weight: 700; text-align: center; font-size: 16px; margin-top: 10px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: `Order #: ${data.orderNumber}`,
          style: `font-weight: 600; font-size: 14px;`
        },
        {
          type: "text",
          value: `Customer: ${data.customerName}`,
          style: `font-size: 12px;`
        },
        {
          type: "text",
          value: `Date: ${data.paymentDate}`,
          style: `font-size: 12px; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: "--------------------------------",
          style: `text-align: center;`
        },
        {
          type: "text",
          value: "PAYMENT DETAILS",
          style: `font-weight: 600; font-size: 13px; margin-top: 10px;`
        },
        {
          type: "text",
          value: `Payment Method: ${data.paymentMethod}`,
          style: `font-size: 12px;`
        },
        {
          type: "text",
          value: `Amount Paid: ₦${data.paymentAmount.toLocaleString()}`,
          style: `font-size: 13px; font-weight: 700; margin-top: 5px;`
        },
        {
          type: "text",
          value: "--------------------------------",
          style: `text-align: center; margin-top: 10px;`
        },
        {
          type: "text",
          value: `Previous Balance: ₦${data.previousBalance.toLocaleString()}`,
          style: `font-size: 12px;`
        },
        {
          type: "text",
          value: `New Balance: ₦${data.newBalance.toLocaleString()}`,
          style: `font-size: 13px; font-weight: 700; color: ${data.newBalance > 0 ? '#d32f2f' : '#2e7d32'}; margin-bottom: 10px;`
        },
        {
          type: "text",
          value: "================================",
          style: `text-align: center; margin-top: 10px;`
        },
        {
          type: "text",
          value: data.footerMessage || "Thank you for your payment!",
          style: `text-align: center; font-size: 12px; margin-top: 10px; margin-bottom: 20px;`
        }
      ]

      const printOptions: any = {
        preview: options.preview !== undefined ? options.preview : false,
        width: "300px",
        margin: "0 0 0 0",
        copies: 1,
        printerName: printerName,
        timeOutPerLine: 400,
        silent: options.silent !== undefined ? options.silent : true
      }

      await PosPrinter.print(receiptData, printOptions)

      return { success: true }
    } catch (error: any) {
      console.error("Error printing payment receipt:", error)
      return { 
        success: false, 
        error: error.message || "Failed to print payment receipt" 
      }
    }
  }
}

// Export singleton instance
export const receiptPrinter = new ReceiptPrinter()
