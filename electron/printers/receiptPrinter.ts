import { BrowserWindow } from "electron"
import { createRequire } from "module"

const require = createRequire(import.meta.url)

// Try to load the printer module with error handling
let PosPrinter: any = null
let printerAvailable = false

try {
  PosPrinter = require("electron-pos-printer")
  printerAvailable = true
} catch (error) {
  console.warn("⚠ electron-pos-printer not available:", (error as Error).message)
  printerAvailable = false
}

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
   * Safe print function that handles different PosPrinter module structures
   */
  private async safePrint(receiptData: any[], printOptions: any): Promise<void> {
    // Try different ways to access the print function
    let printFunction;
    
    if (typeof PosPrinter.print === 'function') {
      printFunction = PosPrinter.print;
    } else if (PosPrinter.default && typeof PosPrinter.default.print === 'function') {
      printFunction = PosPrinter.default.print;
    } else if (PosPrinter.PosPrinter && typeof PosPrinter.PosPrinter.print === 'function') {
      printFunction = PosPrinter.PosPrinter.print;
    } else {
      // If no print function is available, use browser window fallback
      console.warn("PosPrinter.print function not available, using browser fallback");
      const result = await this.printWithBrowserFallback(receiptData, printOptions);
      if (!result.success) {
        throw new Error(result.error || "Printing failed");
      }
      return;
    }

    try {
      await printFunction(receiptData, printOptions);
    } catch (error: any) {
      console.warn("POS printer failed, falling back to browser printing:", error.message);
      
      // If POS printing fails, try browser fallback
      const result = await this.printWithBrowserFallback(receiptData, printOptions);
      if (!result.success) {
        throw new Error(`POS printer failed: ${error.message}. Browser fallback also failed: ${result.error}`);
      }
    }
  }

  /**
   * Browser fallback for printing when PosPrinter is not available
   */
  private async printWithBrowserFallback(
    receiptData: any[],
    options: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create HTML content from receipt data
      let htmlContent = `
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                margin: 20px; 
                background: white;
                color: black;
              }
              .receipt { 
                max-width: 300px; 
                margin: 0 auto; 
                padding: 20px;
                border: 1px solid #ccc;
                background: white;
              }
              .no-print { 
                text-align: center; 
                margin: 20px 0; 
                padding: 10px; 
                background: #f0f0f0; 
                border: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="no-print">
              <h3>Receipt Preview</h3>
              <p>No printer detected. This is a preview of your receipt.</p>
              <p>You can save this page as PDF using Ctrl+P → Save as PDF</p>
            </div>
            <div class="receipt">
      `;

      receiptData.forEach(item => {
        if (item.type === 'text') {
          // Convert style object to CSS string for HTML
          let cssStyle = '';
          if (item.style && typeof item.style === 'object') {
            cssStyle = Object.entries(item.style).map(([key, value]) => {
              // Convert camelCase to kebab-case
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              const cssValue = typeof value === 'number' && 
                (key.includes('font') || key.includes('margin') || key.includes('padding')) 
                ? `${value}px` : value;
              return `${cssKey}: ${cssValue}`;
            }).join('; ');
          }
          htmlContent += `<div style="${cssStyle}">${item.value}</div>`;
        }
      });

      htmlContent += `
            </div>
            <div class="no-print" style="margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">
                Save as PDF / Print
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">
                Close
              </button>
            </div>
          </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = new BrowserWindow({
        width: 500,
        height: 700,
        show: true, // Show the window so user can see the receipt
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        },
        title: 'Receipt Preview'
      });

      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
      
      // Don't auto-print if no printers available, just show the preview
      // The user can manually print/save as PDF from the window
      
      return { success: true };
    } catch (error: any) {
      console.error("Browser fallback printing failed:", error);
      return { 
        success: false, 
        error: "Unable to display receipt preview. Please check your system configuration." 
      };
    }
  }

  /**
   * Browser fallback for order receipts
   */
  private async printOrderReceiptWithBrowserFallback(
    data: ReceiptData,
    options: PrinterOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const receiptData: any[] = [
        {
          type: "text",
          value: data.shopName,
          style: { fontWeight: 700, textAlign: 'center', fontSize: 18, marginTop: 10 }
        },
        {
          type: "text",
          value: data.shopAddress,
          style: { textAlign: 'center', fontSize: 12 }
        },
        {
          type: "text",
          value: `Tel: ${data.shopPhone}`,
          style: { textAlign: 'center', fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "ORDER RECEIPT",
          style: { fontWeight: 700, textAlign: 'center', fontSize: 16, marginTop: 10, marginBottom: 10 }
        },
        {
          type: "text",
          value: `Order #: ${data.orderNumber}`,
          style: { fontWeight: 600, fontSize: 14 }
        },
        {
          type: "text",
          value: `Date: ${data.orderDate}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Pickup Date: ${data.pickupDate}`,
          style: { fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "CUSTOMER DETAILS",
          style: { fontWeight: 600, fontSize: 13, marginTop: 10 }
        },
        {
          type: "text",
          value: `Name: ${data.customerName}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Phone: ${data.customerPhone}`,
          style: { fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "ITEMS",
          style: { fontWeight: 600, fontSize: 13, marginTop: 10, marginBottom: 5 }
        }
      ]

      // Add items
      data.items.forEach((item) => {
        receiptData.push({
          type: "text",
          value: `${item.service_name} x ${item.quantity}`,
          style: { fontSize: 12 }
        })
        receiptData.push({
          type: "text",
          value: `  ₦${item.price.toLocaleString()} x ${item.quantity} = ₦${item.subtotal.toLocaleString()}`,
          style: { fontSize: 11, marginBottom: 5 }
        })
      })

      // Add totals
      receiptData.push(
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: `TOTAL AMOUNT: ₦${data.totalAmount.toLocaleString()}`,
          style: { fontWeight: 700, fontSize: 14, marginTop: 5 }
        },
        {
          type: "text",
          value: `Amount Paid: ₦${data.amountPaid.toLocaleString()}`,
          style: { fontSize: 13 }
        },
        {
          type: "text",
          value: `Balance Due: ₦${data.balance.toLocaleString()}`,
          style: { 
            fontSize: 13, 
            fontWeight: data.balance > 0 ? 700 : 400, 
            color: data.balance > 0 ? '#d32f2f' : '#2e7d32', 
            marginBottom: 10 
          }
        }
      )

      // Add notes if present
      if (data.notes) {
        receiptData.push(
          {
            type: "text",
            value: "--------------------------------",
            style: { textAlign: 'center' }
          },
          {
            type: "text",
            value: "NOTES:",
            style: { fontWeight: 600, fontSize: 12, marginTop: 5 }
          },
          {
            type: "text",
            value: data.notes,
            style: { fontSize: 11, marginBottom: 10 }
          }
        )
      }

      // Add footer
      receiptData.push(
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: data.footerMessage || "Thank you for your business!",
          style: { textAlign: 'center', fontSize: 12, marginTop: 10 }
        },
        {
          type: "text",
          value: "Please keep this receipt for collection",
          style: { textAlign: 'center', fontSize: 11, fontStyle: 'italic', marginBottom: 20 }
        }
      )

      return await this.printWithBrowserFallback(receiptData, options);
    } catch (error: any) {
      console.error("Error creating order receipt for browser fallback:", error);
      return { 
        success: false, 
        error: error.message || "Failed to create receipt preview" 
      };
    }
  }

  /**
   * Browser fallback for payment receipts
   */
  private async printPaymentReceiptWithBrowserFallback(
    data: PaymentReceiptData,
    options: PrinterOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const receiptData: any[] = [
        {
          type: "text",
          value: data.shopName,
          style: { fontWeight: 700, textAlign: 'center', fontSize: 18, marginTop: 10 }
        },
        {
          type: "text",
          value: data.shopAddress,
          style: { textAlign: 'center', fontSize: 12 }
        },
        {
          type: "text",
          value: `Tel: ${data.shopPhone}`,
          style: { textAlign: 'center', fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "PAYMENT RECEIPT",
          style: { fontWeight: 700, textAlign: 'center', fontSize: 16, marginTop: 10, marginBottom: 10 }
        },
        {
          type: "text",
          value: `Order #: ${data.orderNumber}`,
          style: { fontWeight: 600, fontSize: 14 }
        },
        {
          type: "text",
          value: `Customer: ${data.customerName}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Date: ${data.paymentDate}`,
          style: { fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "PAYMENT DETAILS",
          style: { fontWeight: 600, fontSize: 13, marginTop: 10 }
        },
        {
          type: "text",
          value: `Payment Method: ${data.paymentMethod}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Amount Paid: ₦${data.paymentAmount.toLocaleString()}`,
          style: { fontSize: 13, fontWeight: 700, marginTop: 5 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: `Previous Balance: ₦${data.previousBalance.toLocaleString()}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `New Balance: ₦${data.newBalance.toLocaleString()}`,
          style: { 
            fontSize: 13, 
            fontWeight: 700, 
            color: data.newBalance > 0 ? '#d32f2f' : '#2e7d32', 
            marginBottom: 10 
          }
        },
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: data.footerMessage || "Thank you for your payment!",
          style: { textAlign: 'center', fontSize: 12, marginTop: 10, marginBottom: 20 }
        }
      ]

      return await this.printWithBrowserFallback(receiptData, options);
    } catch (error: any) {
      console.error("Error creating payment receipt for browser fallback:", error);
      return { 
        success: false, 
        error: error.message || "Failed to create receipt preview" 
      };
    }
  }

  /**
   * Get list of available printers
   */
  async getAvailablePrinters(): Promise<string[]> {
    if (!printerAvailable || !PosPrinter) {
      console.warn("Printer system not available")
      return []
    }

    try {
      // Try different ways to access getPrinters function
      let getPrinters;
      
      if (typeof PosPrinter.getPrinters === 'function') {
        getPrinters = PosPrinter.getPrinters;
      } else if (PosPrinter.default && typeof PosPrinter.default.getPrinters === 'function') {
        getPrinters = PosPrinter.default.getPrinters;
      } else {
        // Fallback: return default system printer names
        console.warn("getPrinters function not available, using fallback");
        return ["Default Printer", "Microsoft Print to PDF"];
      }
      
      const printers = await getPrinters();
      return Array.isArray(printers) ? printers.map((p: any) => p.name || p) : [];
    } catch (error) {
      console.warn("Error getting printers, using fallback:", (error as Error).message);
      // Return fallback printer options
      return ["Default Printer", "Microsoft Print to PDF"];
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
    // Always try to print, even if PosPrinter is not available (use browser fallback)
    if (!printerAvailable || !PosPrinter) {
      console.warn("PosPrinter not available, using browser fallback for order receipt");
      return await this.printOrderReceiptWithBrowserFallback(data, options);
    }

    try {
      const printerName = options.printerName || this.defaultPrinter
      
      const receiptData: any[] = [
        {
          type: "text",
          value: data.shopName,
          style: { fontWeight: 700, textAlign: 'center', fontSize: 18, marginTop: 10 }
        },
        {
          type: "text",
          value: data.shopAddress,
          style: { textAlign: 'center', fontSize: 12 }
        },
        {
          type: "text",
          value: `Tel: ${data.shopPhone}`,
          style: { textAlign: 'center', fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "ORDER RECEIPT",
          style: { fontWeight: 700, textAlign: 'center', fontSize: 16, marginTop: 10, marginBottom: 10 }
        },
        {
          type: "text",
          value: `Order #: ${data.orderNumber}`,
          style: { fontWeight: 600, fontSize: 14 }
        },
        {
          type: "text",
          value: `Date: ${data.orderDate}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Pickup Date: ${data.pickupDate}`,
          style: { fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "CUSTOMER DETAILS",
          style: { fontWeight: 600, fontSize: 13, marginTop: 10 }
        },
        {
          type: "text",
          value: `Name: ${data.customerName}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Phone: ${data.customerPhone}`,
          style: { fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "ITEMS",
          style: { fontWeight: 600, fontSize: 13, marginTop: 10, marginBottom: 5 }
        }
      ]

      // Add items
      data.items.forEach((item) => {
        receiptData.push({
          type: "text",
          value: `${item.service_name} x ${item.quantity}`,
          style: { fontSize: 12 }
        })
        receiptData.push({
          type: "text",
          value: `  ₦${item.price.toLocaleString()} x ${item.quantity} = ₦${item.subtotal.toLocaleString()}`,
          style: { fontSize: 11, marginBottom: 5 }
        })
      })

      // Add totals
      receiptData.push(
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: `TOTAL AMOUNT: ₦${data.totalAmount.toLocaleString()}`,
          style: { fontWeight: 700, fontSize: 14, marginTop: 5 }
        },
        {
          type: "text",
          value: `Amount Paid: ₦${data.amountPaid.toLocaleString()}`,
          style: { fontSize: 13 }
        },
        {
          type: "text",
          value: `Balance Due: ₦${data.balance.toLocaleString()}`,
          style: { 
            fontSize: 13, 
            fontWeight: data.balance > 0 ? 700 : 400, 
            color: data.balance > 0 ? '#d32f2f' : '#2e7d32', 
            marginBottom: 10 
          }
        }
      )

      // Add notes if present
      if (data.notes) {
        receiptData.push(
          {
            type: "text",
            value: "--------------------------------",
            style: { textAlign: 'center' }
          },
          {
            type: "text",
            value: "NOTES:",
            style: { fontWeight: 600, fontSize: 12, marginTop: 5 }
          },
          {
            type: "text",
            value: data.notes,
            style: { fontSize: 11, marginBottom: 10 }
          }
        )
      }

      // Add footer
      receiptData.push(
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: data.footerMessage || "Thank you for your business!",
          style: { textAlign: 'center', fontSize: 12, marginTop: 10 }
        },
        {
          type: "text",
          value: "Please keep this receipt for collection",
          style: { textAlign: 'center', fontSize: 11, fontStyle: 'italic', marginBottom: 20 }
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

      await this.safePrint(receiptData, printOptions)

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
    // Always try to print, even if PosPrinter is not available (use browser fallback)
    if (!printerAvailable || !PosPrinter) {
      console.warn("PosPrinter not available, using browser fallback for payment receipt");
      return await this.printPaymentReceiptWithBrowserFallback(data, options);
    }

    try {
      const printerName = options.printerName || this.defaultPrinter
      
      const receiptData: any[] = [
        {
          type: "text",
          value: data.shopName,
          style: { fontWeight: 700, textAlign: 'center', fontSize: 18, marginTop: 10 }
        },
        {
          type: "text",
          value: data.shopAddress,
          style: { textAlign: 'center', fontSize: 12 }
        },
        {
          type: "text",
          value: `Tel: ${data.shopPhone}`,
          style: { textAlign: 'center', fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "PAYMENT RECEIPT",
          style: { fontWeight: 700, textAlign: 'center', fontSize: 16, marginTop: 10, marginBottom: 10 }
        },
        {
          type: "text",
          value: `Order #: ${data.orderNumber}`,
          style: { fontWeight: 600, fontSize: 14 }
        },
        {
          type: "text",
          value: `Customer: ${data.customerName}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Date: ${data.paymentDate}`,
          style: { fontSize: 12, marginBottom: 10 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center' }
        },
        {
          type: "text",
          value: "PAYMENT DETAILS",
          style: { fontWeight: 600, fontSize: 13, marginTop: 10 }
        },
        {
          type: "text",
          value: `Payment Method: ${data.paymentMethod}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `Amount Paid: ₦${data.paymentAmount.toLocaleString()}`,
          style: { fontSize: 13, fontWeight: 700, marginTop: 5 }
        },
        {
          type: "text",
          value: "--------------------------------",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: `Previous Balance: ₦${data.previousBalance.toLocaleString()}`,
          style: { fontSize: 12 }
        },
        {
          type: "text",
          value: `New Balance: ₦${data.newBalance.toLocaleString()}`,
          style: { 
            fontSize: 13, 
            fontWeight: 700, 
            color: data.newBalance > 0 ? '#d32f2f' : '#2e7d32', 
            marginBottom: 10 
          }
        },
        {
          type: "text",
          value: "================================",
          style: { textAlign: 'center', marginTop: 10 }
        },
        {
          type: "text",
          value: data.footerMessage || "Thank you for your payment!",
          style: { textAlign: 'center', fontSize: 12, marginTop: 10, marginBottom: 20 }
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

      await this.safePrint(receiptData, printOptions)

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