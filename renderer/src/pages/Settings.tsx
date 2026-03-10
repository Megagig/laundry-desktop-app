import { useState, useEffect } from "react"
import { Button, Text, Card, Tabs, TextInput, Textarea, Select, Table } from "@mantine/core"
import { IconSettings, IconBuildingStore, IconPrinter, IconReceipt, IconDeviceFloppy, IconDatabase, IconDownload, IconUpload, IconFileExport, IconTrash } from "@tabler/icons-react"
import { LoadingSpinner } from "../components/common"
import { showSuccessNotification, showErrorNotification } from "../utils/notifications"

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string | null>("shop")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [printers, setPrinters] = useState<string[]>([])
  const [backups, setBackups] = useState<any[]>([])
  const [dbStats, setDbStats] = useState<any>(null)

  // Shop Information
  const [shopName, setShopName] = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const [shopEmail, setShopEmail] = useState("")

  // Printer Settings
  const [defaultPrinter, setDefaultPrinter] = useState("")

  // Receipt Settings
  const [receiptFooter, setReceiptFooter] = useState("")
  const [receiptHeader, setReceiptHeader] = useState("")

  // General Settings
  const [currencySymbol, setCurrencySymbol] = useState("₦")
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY")
  const [defaultPickupDays, setDefaultPickupDays] = useState("3")

  useEffect(() => {
    loadSettings()
    loadPrinters()
    if (activeTab === "data") {
      loadBackups()
      loadDatabaseStats()
    }
  }, [activeTab])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const result = await window.api.settings.getAll()
      if (result.success) {
        const settings = result.data
        setShopName(settings.shop_name || "")
        setShopAddress(settings.shop_address || "")
        setShopPhone(settings.shop_phone || "")
        setShopEmail(settings.shop_email || "")
        setDefaultPrinter(settings.default_printer || "")
        setReceiptFooter(settings.receipt_footer || "Thank you for your business!")
        setReceiptHeader(settings.receipt_header || "")
        setCurrencySymbol(settings.currency_symbol || "₦")
        setDateFormat(settings.date_format || "DD/MM/YYYY")
        setDefaultPickupDays(settings.default_pickup_days || "3")
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPrinters = async () => {
    try {
      const result = await window.api.printer.getPrinters()
      if (result.success) {
        setPrinters(result.data)
      }
    } catch (error) {
      console.error("Error loading printers:", error)
    }
  }

  const saveShopSettings = async () => {
    setIsSaving(true)
    try {
      await window.api.settings.updateMultiple({
        shop_name: shopName,
        shop_address: shopAddress,
        shop_phone: shopPhone,
        shop_email: shopEmail
      })
      showSuccessNotification("Shop information saved successfully!")
    } catch (error) {
      console.error("Error saving shop settings:", error)
      showErrorNotification("Failed to save shop information")
    } finally {
      setIsSaving(false)
    }
  }

  const savePrinterSettings = async () => {
    setIsSaving(true)
    try {
      await window.api.settings.updateMultiple({
        default_printer: defaultPrinter
      })
      if (defaultPrinter) {
        await window.api.printer.setDefault(defaultPrinter)
      }
      showSuccessNotification("Printer settings saved successfully!")
    } catch (error) {
      console.error("Error saving printer settings:", error)
      showErrorNotification("Failed to save printer settings")
    } finally {
      setIsSaving(false)
    }
  }

  const saveReceiptSettings = async () => {
    setIsSaving(true)
    try {
      await window.api.settings.updateMultiple({
        receipt_footer: receiptFooter,
        receipt_header: receiptHeader
      })
      showSuccessNotification("Receipt settings saved successfully!")
    } catch (error) {
      console.error("Error saving receipt settings:", error)
      showErrorNotification("Failed to save receipt settings")
    } finally {
      setIsSaving(false)
    }
  }

  const saveGeneralSettings = async () => {
    setIsSaving(true)
    try {
      await window.api.settings.updateMultiple({
        currency_symbol: currencySymbol,
        date_format: dateFormat,
        default_pickup_days: defaultPickupDays
      })
      showSuccessNotification("General settings saved successfully!")
    } catch (error) {
      console.error("Error saving general settings:", error)
      showErrorNotification("Failed to save general settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestPrint = async () => {
    try {
      const result = await window.api.printer.testPrint(defaultPrinter || undefined)
      if (result.success) {
        showSuccessNotification("Test print sent successfully!")
      } else {
        showErrorNotification(`Test print failed: ${result.error}`)
      }
    } catch (error: any) {
      showErrorNotification(`Test print failed: ${error.message}`)
    }
  }

  const loadBackups = async () => {
    try {
      const result = await window.api.backup.list()
      if (result.success && result.backups) {
        setBackups(result.backups)
      }
    } catch (error) {
      console.error("Error loading backups:", error)
    }
  }

  const loadDatabaseStats = async () => {
    try {
      const result = await window.api.backup.getStats()
      if (result.success && result.stats) {
        setDbStats(result.stats)
      }
    } catch (error) {
      console.error("Error loading database stats:", error)
    }
  }

  const handleCreateBackup = async () => {
    setIsSaving(true)
    try {
      const result = await window.api.backup.create()
      if (result.success) {
        showSuccessNotification(`Backup created successfully at: ${result.path}`, "Backup Created")
        loadBackups()
      } else {
        showErrorNotification(`Backup failed: ${result.error}`)
      }
    } catch (error: any) {
      showErrorNotification(`Backup failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!confirm("Are you sure you want to restore from backup? This will replace all current data!")) {
      return
    }

    setIsSaving(true)
    try {
      const result = await window.api.backup.restore()
      if (result.success) {
        showSuccessNotification("Database restored successfully! Please restart the application.", "Restore Complete")
      } else {
        showErrorNotification(`Restore failed: ${result.error}`)
      }
    } catch (error: any) {
      showErrorNotification(`Restore failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBackup = async (backupPath: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) {
      return
    }

    try {
      const result = await window.api.backup.delete(backupPath)
      if (result.success) {
        showSuccessNotification("Backup deleted successfully!")
        loadBackups()
      } else {
        showErrorNotification(`Delete failed: ${result.error}`)
      }
    } catch (error: any) {
      showErrorNotification(`Delete failed: ${error.message}`)
    }
  }

  const handleExportCSV = async (tableName: string) => {
    setIsSaving(true)
    try {
      const result = await window.api.backup.exportCSV(tableName)
      if (result.success) {
        showSuccessNotification(`${tableName} exported successfully!`, "Export Complete")
      } else {
        showErrorNotification(`Export failed: ${result.error}`)
      }
    } catch (error: any) {
      showErrorNotification(`Export failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings & Configuration</h1>
        <Text size="sm" c="dimmed">Manage your application settings</Text>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="shop" leftSection={<IconBuildingStore size={16} />}>
            Shop Information
          </Tabs.Tab>
          <Tabs.Tab value="printer" leftSection={<IconPrinter size={16} />}>
            Printer Settings
          </Tabs.Tab>
          <Tabs.Tab value="receipt" leftSection={<IconReceipt size={16} />}>
            Receipt Settings
          </Tabs.Tab>
          <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
            General Settings
          </Tabs.Tab>
          <Tabs.Tab value="data" leftSection={<IconDatabase size={16} />}>
            Data Management
          </Tabs.Tab>
        </Tabs.List>

        {/* Shop Information Tab */}
        <Tabs.Panel value="shop" pt="md">
          <Card withBorder>
            <Text size="lg" fw={600} className="mb-4">Shop Information</Text>
            <div className="space-y-4">
              <TextInput
                label="Shop Name"
                placeholder="Enter shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />

              <Textarea
                label="Shop Address"
                placeholder="Enter shop address"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                minRows={3}
              />

              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
              />

              <TextInput
                label="Email Address"
                placeholder="Enter email address"
                type="email"
                value={shopEmail}
                onChange={(e) => setShopEmail(e.target.value)}
              />

              <div className="flex justify-end">
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={saveShopSettings}
                  loading={isSaving}
                >
                  Save Shop Information
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Panel>

        {/* Printer Settings Tab */}
        <Tabs.Panel value="printer" pt="md">
          <Card withBorder>
            <Text size="lg" fw={600} className="mb-4">Printer Configuration</Text>
            <div className="space-y-4">
              <Select
                label="Default Printer"
                placeholder="Select default printer"
                value={defaultPrinter}
                onChange={(value) => setDefaultPrinter(value || "")}
                data={printers.map(p => ({ value: p, label: p }))}
                searchable
                clearable
              />

              {printers.length === 0 && (
                <Text size="sm" c="dimmed">
                  No printers detected. Please ensure a printer is installed and connected.
                </Text>
              )}

              <div className="flex justify-between">
                <Button
                  variant="light"
                  onClick={handleTestPrint}
                  disabled={!defaultPrinter}
                >
                  Test Print
                </Button>
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={savePrinterSettings}
                  loading={isSaving}
                >
                  Save Printer Settings
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Panel>

        {/* Receipt Settings Tab */}
        <Tabs.Panel value="receipt" pt="md">
          <Card withBorder>
            <Text size="lg" fw={600} className="mb-4">Receipt Configuration</Text>
            <div className="space-y-4">
              <TextInput
                label="Receipt Header"
                placeholder="Optional header text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
              />

              <Textarea
                label="Receipt Footer"
                placeholder="Footer message (e.g., Thank you for your business!)"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                minRows={3}
              />

              <Text size="sm" c="dimmed">
                This message will appear at the bottom of all printed receipts.
              </Text>

              <div className="flex justify-end">
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={saveReceiptSettings}
                  loading={isSaving}
                >
                  Save Receipt Settings
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Panel>

        {/* General Settings Tab */}
        <Tabs.Panel value="general" pt="md">
          <Card withBorder>
            <Text size="lg" fw={600} className="mb-4">General Configuration</Text>
            <div className="space-y-4">
              <TextInput
                label="Currency Symbol"
                placeholder="₦"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                maxLength={3}
              />

              <Select
                label="Date Format"
                value={dateFormat}
                onChange={(value) => setDateFormat(value || "DD/MM/YYYY")}
                data={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2026)" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2026)" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-12-31)" }
                ]}
              />

              <Select
                label="Default Pickup Days"
                description="Number of days from order date to pickup date"
                value={defaultPickupDays}
                onChange={(value) => setDefaultPickupDays(value || "3")}
                data={[
                  { value: "1", label: "1 Day" },
                  { value: "2", label: "2 Days" },
                  { value: "3", label: "3 Days" },
                  { value: "5", label: "5 Days" },
                  { value: "7", label: "7 Days" }
                ]}
              />

              <div className="flex justify-end">
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={saveGeneralSettings}
                  loading={isSaving}
                >
                  Save General Settings
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Panel>

        {/* Data Management Tab */}
        <Tabs.Panel value="data" pt="md">
          <div className="space-y-4">
            {/* Database Statistics */}
            <Card withBorder>
              <Text size="lg" fw={600} className="mb-4">Database Statistics</Text>
              {dbStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Text size="sm" c="dimmed">Customers</Text>
                    <Text size="xl" fw={600}>{dbStats.customers}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Orders</Text>
                    <Text size="xl" fw={600}>{dbStats.orders}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Services</Text>
                    <Text size="xl" fw={600}>{dbStats.services}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Payments</Text>
                    <Text size="xl" fw={600}>{dbStats.payments}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Expenses</Text>
                    <Text size="xl" fw={600}>{dbStats.expenses}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Database Size</Text>
                    <Text size="xl" fw={600}>{formatFileSize(dbStats.databaseSize)}</Text>
                  </div>
                </div>
              )}
            </Card>

            {/* Backup & Restore */}
            <Card withBorder>
              <Text size="lg" fw={600} className="mb-4">Backup & Restore</Text>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={handleCreateBackup}
                    loading={isSaving}
                  >
                    Create Backup
                  </Button>
                  <Button
                    leftSection={<IconUpload size={16} />}
                    onClick={handleRestoreBackup}
                    loading={isSaving}
                    color="orange"
                  >
                    Restore from Backup
                  </Button>
                </div>

                <Text size="sm" c="dimmed">
                  Create regular backups to protect your data. Backups are saved to your user data folder.
                </Text>

                {/* Backup List */}
                {backups.length > 0 && (
                  <div>
                    <Text size="sm" fw={600} className="mb-2">Recent Backups</Text>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Size</Table.Th>
                          <Table.Th>Date</Table.Th>
                          <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {backups.slice(0, 5).map((backup) => (
                          <Table.Tr key={backup.path}>
                            <Table.Td>{backup.name}</Table.Td>
                            <Table.Td>{formatFileSize(backup.size)}</Table.Td>
                            <Table.Td>{formatDate(backup.date)}</Table.Td>
                            <Table.Td>
                              <Button
                                size="xs"
                                color="red"
                                variant="light"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDeleteBackup(backup.path)}
                              >
                                Delete
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>

            {/* Export Data */}
            <Card withBorder>
              <Text size="lg" fw={600} className="mb-4">Export Data to CSV</Text>
              <div className="space-y-3">
                <Text size="sm" c="dimmed">
                  Export your data to CSV format for use in spreadsheet applications.
                </Text>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExportCSV("customers")}
                    loading={isSaving}
                  >
                    Export Customers
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExportCSV("orders")}
                    loading={isSaving}
                  >
                    Export Orders
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExportCSV("services")}
                    loading={isSaving}
                  >
                    Export Services
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExportCSV("payments")}
                    loading={isSaving}
                  >
                    Export Payments
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExportCSV("expenses")}
                    loading={isSaving}
                  >
                    Export Expenses
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.Panel>
      </Tabs>

      {/* Application Info */}
      <Card withBorder className="bg-gray-50">
        <Text size="sm" fw={600} className="mb-2">Application Information</Text>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Text c="dimmed">Version:</Text>
          <Text>1.0.0</Text>
          <Text c="dimmed">Database:</Text>
          <Text>SQLite (Prisma ORM)</Text>
          <Text c="dimmed">Framework:</Text>
          <Text>Electron + React + TypeScript</Text>
        </div>
      </Card>
    </div>
  )
}
