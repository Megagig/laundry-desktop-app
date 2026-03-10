import { useState } from "react"
import { Button, Text, Select, Tabs } from "@mantine/core"
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <Text className="text-lg text-gray-600">Generate and view business reports</Text>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
        <Text className="text-xl font-bold text-gray-900 mb-6">Report Parameters</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Select
            label="Period"
            size="lg"
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
            size="lg"
            value={startDate}
            onChange={(value) => {
              setStartDate(value ? new Date(value) : null)
              setReportPeriod("custom")
            }}
            clearable
          />

          <DateInput
            label="End Date"
            size="lg"
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
              size="lg"
              leftSection={<IconRefresh size={20} />}
              onClick={handleGenerateReport}
              loading={isLoading}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="mb-6">
          <Tabs.Tab value="revenue" leftSection={<IconCash size={20} />} className="text-base px-6 py-3">
            Revenue Report
          </Tabs.Tab>
          <Tabs.Tab value="expenses" leftSection={<IconReceipt size={20} />} className="text-base px-6 py-3">
            Expense Report
          </Tabs.Tab>
          <Tabs.Tab value="profitloss" leftSection={<IconTrendingUp size={20} />} className="text-base px-6 py-3">
            Profit & Loss
          </Tabs.Tab>
          <Tabs.Tab value="outstanding" leftSection={<IconFileAnalytics size={20} />} className="text-base px-6 py-3">
            Outstanding Balances
          </Tabs.Tab>
        </Tabs.List>

        {/* Revenue Report Tab */}
        <Tabs.Panel value="revenue" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : revenueData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Orders</Text>
                  <Text className="text-4xl font-bold text-gray-900">{revenueData.totalOrders}</Text>
                </div>
                <div className="bg-green-50 rounded-2xl border border-green-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Revenue</Text>
                  <Text className="text-4xl font-bold text-green-600">₦{(revenueData.totalRevenue || 0).toLocaleString()}</Text>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Amount Collected</Text>
                  <Text className="text-4xl font-bold text-blue-600">₦{(revenueData.totalPaid || 0).toLocaleString()}</Text>
                </div>
                <div className="bg-red-50 rounded-2xl border border-red-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Pending Balance</Text>
                  <Text className="text-4xl font-bold text-red-600">₦{(revenueData.totalBalance || 0).toLocaleString()}</Text>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                <Text className="text-xl font-bold text-gray-900 mb-6">Additional Metrics</Text>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <Text size="md" className="text-gray-600 font-semibold mb-2">Average Order Value</Text>
                    <Text className="text-3xl font-bold text-gray-900">₦{Math.round(revenueData.averageOrderValue || 0).toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text size="md" className="text-gray-600 font-semibold mb-2">Collection Rate</Text>
                    <Text className="text-3xl font-bold text-gray-900">
                      {revenueData.totalRevenue > 0 
                        ? ((revenueData.totalPaid / revenueData.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-12">
              <Text className="text-gray-500 text-center text-lg">
                Click "Generate Report" to view revenue data
              </Text>
            </div>
          )}
        </Tabs.Panel>

        {/* Expense Report Tab */}
        <Tabs.Panel value="expenses" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : expenseData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-2xl border border-red-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Expenses</Text>
                  <Text className="text-4xl font-bold text-red-600">₦{(expenseData.totalExpenses || 0).toLocaleString()}</Text>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Expense Count</Text>
                  <Text className="text-4xl font-bold text-gray-900">{expenseData.expenseCount}</Text>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Average Expense</Text>
                  <Text className="text-4xl font-bold text-blue-600">₦{Math.round(expenseData.averageExpense || 0).toLocaleString()}</Text>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                <Text className="text-xl font-bold text-gray-900 mb-6">Expenses by Category</Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {Object.entries(expenseData.byCategory)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, amount]) => (
                      <div key={category} className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <Text size="md" fw={600} className="mb-2">{category}</Text>
                        <Text className="text-2xl font-bold text-gray-900">₦{(amount as number).toLocaleString()}</Text>
                        <Text size="sm" className="text-gray-600 font-medium mt-1">
                          {expenseData.totalExpenses > 0 ? ((amount as number / expenseData.totalExpenses) * 100).toFixed(1) : '0.0'}%
                        </Text>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-12">
              <Text className="text-gray-500 text-center text-lg">
                Click "Generate Report" to view expense data
              </Text>
            </div>
          )}
        </Tabs.Panel>

        {/* Profit & Loss Tab */}
        <Tabs.Panel value="profitloss" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : profitLossData ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                <Text className="text-2xl font-bold text-gray-900 mb-8">Profit & Loss Statement</Text>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <Text size="lg" fw={700}>Total Revenue</Text>
                    <Text size="xl" fw={700} className="text-green-600">₦{(profitLossData.totalRevenue || 0).toLocaleString()}</Text>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <Text size="lg" fw={700}>Total Expenses</Text>
                    <Text size="xl" fw={700} className="text-red-600">₦{(profitLossData.totalExpenses || 0).toLocaleString()}</Text>
                  </div>
                  
                  <div className={`flex justify-between items-center py-6 px-6 rounded-2xl ${profitLossData.netProfit >= 0 ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
                    <Text className="text-2xl font-bold text-gray-900">Net Profit/Loss</Text>
                    <Text 
                      className="text-4xl font-bold"
                      c={profitLossData.netProfit >= 0 ? "green" : "red"}
                    >
                      ₦{(profitLossData.netProfit || 0).toLocaleString()}
                    </Text>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <Text size="lg" className="text-gray-600 font-semibold">Profit Margin</Text>
                    <Text size="xl" fw={700}>
                      {profitLossData.totalRevenue > 0
                        ? ((profitLossData.netProfit / profitLossData.totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-12">
              <Text className="text-gray-500 text-center text-lg">
                Click "Generate Report" to view profit & loss data
              </Text>
            </div>
          )}
        </Tabs.Panel>

        {/* Outstanding Balances Tab */}
        <Tabs.Panel value="outstanding" pt="md">
          {isLoading ? (
            <LoadingSpinner />
          ) : outstandingData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-2xl border border-red-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Outstanding</Text>
                  <Text className="text-4xl font-bold text-red-600">₦{(outstandingData.totalOutstanding || 0).toLocaleString()}</Text>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Orders with Balance</Text>
                  <Text className="text-4xl font-bold text-gray-900">{outstandingData.totalOrders}</Text>
                </div>
                <div className="bg-orange-50 rounded-2xl border border-orange-100 shadow-md p-8">
                  <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Average Balance</Text>
                  <Text className="text-4xl font-bold text-orange-600">₦{Math.round(outstandingData.averageBalance || 0).toLocaleString()}</Text>
                </div>
              </div>

              {outstandingData.orders.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
                  <Text className="text-xl font-bold text-gray-900 mb-6">Top Outstanding Orders</Text>
                  <div className="space-y-3">
                    {outstandingData.orders
                      .sort((a: any, b: any) => b.balance - a.balance)
                      .slice(0, 10)
                      .map((order: any) => (
                        <div key={order.id} className="flex justify-between items-center p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                          <div>
                            <Text size="md" fw={700}>{order.order_number}</Text>
                            <Text size="md" className="text-gray-600">{order.customer_name}</Text>
                          </div>
                          <Text className="text-2xl font-bold text-red-600">₦{(order.balance || 0).toLocaleString()}</Text>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-12">
              <Text className="text-gray-500 text-center text-lg">
                Click "Generate Report" to view outstanding balances
              </Text>
            </div>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
