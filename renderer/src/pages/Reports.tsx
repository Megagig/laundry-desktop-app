import { useState } from "react"
import { Button, Text, Card, Select, Tabs } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconRefresh, IconFileAnalytics, IconCash, IconReceipt, IconTrendingUp } from "@tabler/icons-react"
import { LoadingSpinner } from "../components/common"

export default function Reports() {
  const [activeTab, setActiveTab] = useState<string | null>("revenue")
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date
  })
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [reportPeriod, setReportPeriod] = useState<string>("custom")

  // Report data states
  const [revenueData, setRevenueData] = useState<any>(null)
  const [expenseData, setExpenseData] = useState<any>(null)
  const [profitLossData, setProfitLossData] = useState<any>(null)
  const [outstandingData, setOutstandingData] = useState<any>(null)

  const handlePeriodChange = (period: string) => {
    setReportPeriod(period)
    const today = new Date()
    
    switch (period) {
      case "today":
        setStartDate(today)
        setEndDate(today)
        break
      case "week":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        setStartDate(weekStart)
        setEndDate(today)
        break
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        setStartDate(monthStart)
        setEndDate(today)
        break
      case "year":
        const yearStart = new Date(today.getFullYear(), 0, 1)
        setStartDate(yearStart)
        setEndDate(today)
        break
      default:
        // custom - don't change dates
        break
    }
  }

  const fetchRevenueReport = async () => {
    if (!startDate || !endDate) return
    
    setIsLoading(true)
    try {
      const result = await window.api.order.getByDateRange(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      )
      
      if (result.success) {
        const orders = result.data
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total_amount, 0)
        const totalPaid = orders.reduce((sum: number, order: any) => sum + order.amount_paid, 0)
        const totalBalance = orders.reduce((sum: number, order: any) => sum + order.balance, 0)
        
        setRevenueData({
          orders,
          totalOrders: orders.length,
          totalRevenue,
          totalPaid,
          totalBalance,
          averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
        })
      }
    } catch (error) {
      console.error("Error fetching revenue report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExpenseReport = async () => {
    if (!startDate || !endDate) return
    
    setIsLoading(true)
    try {
      const result = await window.api.expense.getByDateRange(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      )
      
      if (result.success) {
        const expenses = result.data
        const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
        
        // Group by category
        const byCategory = expenses.reduce((acc: any, exp: any) => {
          const cat = exp.category || "Other"
          if (!acc[cat]) acc[cat] = 0
          acc[cat] += exp.amount
          return acc
        }, {})
        
        setExpenseData({
          expenses,
          totalExpenses,
          expenseCount: expenses.length,
          byCategory,
          averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0
        })
      }
    } catch (error) {
      console.error("Error fetching expense report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfitLossReport = async () => {
    if (!startDate || !endDate) return
    
    setIsLoading(true)
    try {
      const result = await window.api.report.getProfitLoss(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      )
      
      if (result.success) {
        setProfitLossData(result.data)
      }
    } catch (error) {
      console.error("Error fetching profit/loss report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOutstandingReport = async () => {
    setIsLoading(true)
    try {
      const result = await window.api.payment.getOutstanding()
      
      if (result.success) {
        const orders = result.data
        const totalOutstanding = orders.reduce((sum: number, order: any) => sum + order.balance, 0)
        
        setOutstandingData({
          orders,
          totalOrders: orders.length,
          totalOutstanding,
          averageBalance: orders.length > 0 ? totalOutstanding / orders.length : 0
        })
      }
    } catch (error) {
      console.error("Error fetching outstanding report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = () => {
    switch (activeTab) {
      case "revenue":
        fetchRevenueReport()
        break
      case "expenses":
        fetchExpenseReport()
        break
      case "profitloss":
        fetchProfitLossReport()
        break
      case "outstanding":
        fetchOutstandingReport()
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <Text size="sm" c="dimmed">Generate and view business reports</Text>
      </div>

      {/* Filters */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Report Parameters</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Period"
            value={reportPeriod}
            onChange={(value) => handlePeriodChange(value || "custom")}
            data={[
              { value: "today", label: "Today" },
              { value: "week", label: "Last 7 Days" },
              { value: "month", label: "This Month" },
              { value: "year", label: "This Year" },
              { value: "custom", label: "Custom Range" }
            ]}
          />

          <DateInput
            label="Start Date"
            value={startDate}
            onChange={(value) => {
              setStartDate(value ? new Date(value) : null)
              setReportPeriod("custom")
            }}
            clearable
          />

          <DateInput
            label="End Date"
            value={endDate}
            onChange={(value) => {
              setEndDate(value ? new Date(value) : null)
              setReportPeriod("custom")
            }}
            clearable
          />

          <div className="flex items-end">
            <Button
              fullWidth
              leftSection={<IconRefresh size={16} />}
              onClick={handleGenerateReport}
              loading={isLoading}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="revenue" leftSection={<IconCash size={16} />}>
            Revenue Report
          </Tabs.Tab>
          <Tabs.Tab value="expenses" leftSection={<IconReceipt size={16} />}>
            Expense Report
          </Tabs.Tab>
          <Tabs.Tab value="profitloss" leftSection={<IconTrendingUp size={16} />}>
            Profit & Loss
          </Tabs.Tab>
          <Tabs.Tab value="outstanding" leftSection={<IconFileAnalytics size={16} />}>
            Outstanding Balances
          </Tabs.Tab>
        </Tabs.List>

        {/* Revenue Report Tab */}
        <Tabs.Panel value="revenue" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : revenueData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card withBorder>
                  <Text size="sm" c="dimmed">Total Orders</Text>
                  <Text size="xl" fw={700}>{revenueData.totalOrders}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Total Revenue</Text>
                  <Text size="xl" fw={700} c="green">₦{revenueData.totalRevenue.toLocaleString()}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Amount Collected</Text>
                  <Text size="xl" fw={700} c="blue">₦{revenueData.totalPaid.toLocaleString()}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Pending Balance</Text>
                  <Text size="xl" fw={700} c="red">₦{revenueData.totalBalance.toLocaleString()}</Text>
                </Card>
              </div>

              <Card withBorder>
                <Text size="sm" fw={600} className="mb-3">Additional Metrics</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="sm" c="dimmed">Average Order Value</Text>
                    <Text size="lg" fw={600}>₦{Math.round(revenueData.averageOrderValue).toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">Collection Rate</Text>
                    <Text size="lg" fw={600}>
                      {revenueData.totalRevenue > 0 
                        ? ((revenueData.totalPaid / revenueData.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card withBorder>
              <Text c="dimmed" ta="center" py="xl">
                Click "Generate Report" to view revenue data
              </Text>
            </Card>
          )}
        </Tabs.Panel>

        {/* Expense Report Tab */}
        <Tabs.Panel value="expenses" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : expenseData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card withBorder>
                  <Text size="sm" c="dimmed">Total Expenses</Text>
                  <Text size="xl" fw={700} c="red">₦{expenseData.totalExpenses.toLocaleString()}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Expense Count</Text>
                  <Text size="xl" fw={700}>{expenseData.expenseCount}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Average Expense</Text>
                  <Text size="xl" fw={700}>₦{Math.round(expenseData.averageExpense).toLocaleString()}</Text>
                </Card>
              </div>

              <Card withBorder>
                <Text size="sm" fw={600} className="mb-3">Expenses by Category</Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(expenseData.byCategory)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, amount]) => (
                      <div key={category} className="p-3 bg-gray-50 rounded">
                        <Text size="sm" fw={500}>{category}</Text>
                        <Text size="lg" fw={700}>₦{(amount as number).toLocaleString()}</Text>
                        <Text size="xs" c="dimmed">
                          {((amount as number / expenseData.totalExpenses) * 100).toFixed(1)}%
                        </Text>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card withBorder>
              <Text c="dimmed" ta="center" py="xl">
                Click "Generate Report" to view expense data
              </Text>
            </Card>
          )}
        </Tabs.Panel>

        {/* Profit & Loss Tab */}
        <Tabs.Panel value="profitloss" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : profitLossData ? (
            <div className="space-y-4">
              <Card withBorder>
                <Text size="lg" fw={600} className="mb-4">Profit & Loss Statement</Text>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <Text fw={600}>Total Revenue</Text>
                    <Text fw={600} c="green">₦{profitLossData.totalRevenue.toLocaleString()}</Text>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <Text fw={600}>Total Expenses</Text>
                    <Text fw={600} c="red">₦{profitLossData.totalExpenses.toLocaleString()}</Text>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 bg-gray-50 px-3 rounded">
                    <Text size="lg" fw={700}>Net Profit/Loss</Text>
                    <Text 
                      size="xl" 
                      fw={700}
                      c={profitLossData.netProfit >= 0 ? "green" : "red"}
                    >
                      ₦{profitLossData.netProfit.toLocaleString()}
                    </Text>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <Text c="dimmed">Profit Margin</Text>
                    <Text fw={600}>
                      {profitLossData.totalRevenue > 0
                        ? ((profitLossData.netProfit / profitLossData.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card withBorder>
              <Text c="dimmed" ta="center" py="xl">
                Click "Generate Report" to view profit & loss data
              </Text>
            </Card>
          )}
        </Tabs.Panel>

        {/* Outstanding Balances Tab */}
        <Tabs.Panel value="outstanding" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : outstandingData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card withBorder className="bg-red-50">
                  <Text size="sm" c="dimmed">Total Outstanding</Text>
                  <Text size="xl" fw={700} c="red">₦{outstandingData.totalOutstanding.toLocaleString()}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Orders with Balance</Text>
                  <Text size="xl" fw={700}>{outstandingData.totalOrders}</Text>
                </Card>
                <Card withBorder>
                  <Text size="sm" c="dimmed">Average Balance</Text>
                  <Text size="xl" fw={700}>₦{Math.round(outstandingData.averageBalance).toLocaleString()}</Text>
                </Card>
              </div>

              {outstandingData.orders.length > 0 && (
                <Card withBorder>
                  <Text size="sm" fw={600} className="mb-3">Top Outstanding Orders</Text>
                  <div className="space-y-2">
                    {outstandingData.orders
                      .sort((a: any, b: any) => b.balance - a.balance)
                      .slice(0, 10)
                      .map((order: any) => (
                        <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <Text size="sm" fw={500}>{order.order_number}</Text>
                            <Text size="xs" c="dimmed">{order.customer_name}</Text>
                          </div>
                          <Text size="sm" fw={700} c="red">₦{order.balance.toLocaleString()}</Text>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card withBorder>
              <Text c="dimmed" ta="center" py="xl">
                Click "Generate Report" to view outstanding balances
              </Text>
            </Card>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
