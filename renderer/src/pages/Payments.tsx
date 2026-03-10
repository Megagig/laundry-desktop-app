import { useState, useEffect } from "react"
import { Button, Text, Table, Badge, Select, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconSearch, IconRefresh, IconCash } from "@tabler/icons-react"
import { LoadingSpinner, EmptyState } from "../components/common"

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([])
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("ALL")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchQuery, methodFilter, startDate, endDate])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const result = await window.api.payment.getAll(1000)
      if (result.success) {
        setPayments(result.data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (payment) =>
          payment.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Method filter
    if (methodFilter !== "ALL") {
      filtered = filtered.filter((payment) => payment.method === methodFilter)
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (payment) => new Date(payment.created_at) >= startDate
      )
    }
    if (endDate) {
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      filtered = filtered.filter(
        (payment) => new Date(payment.created_at) <= endOfDay
      )
    }

    setFilteredPayments(filtered)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "CASH":
        return "green"
      case "CARD":
        return "blue"
      case "BANK_TRANSFER":
        return "violet"
      case "MOBILE_MONEY":
        return "orange"
      default:
        return "gray"
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "Cash"
      case "CARD":
        return "Card"
      case "BANK_TRANSFER":
        return "Bank Transfer"
      case "MOBILE_MONEY":
        return "Mobile Money"
      default:
        return method
    }
  }

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  if (isLoading && payments.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
          <Text className="text-lg text-gray-600">View and manage all payment transactions</Text>
        </div>
        <Button
          size="lg"
          leftSection={<IconRefresh size={20} />}
          onClick={fetchPayments}
          loading={isLoading}
          variant="light"
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
        <Text className="text-xl font-bold text-gray-900 mb-6">Filters</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <TextInput
            placeholder="Search by order or customer"
            size="lg"
            leftSection={<IconSearch size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            placeholder="Payment Method"
            size="lg"
            value={methodFilter}
            onChange={(value) => setMethodFilter(value || "ALL")}
            data={[
              { value: "ALL", label: "All Methods" },
              { value: "CASH", label: "Cash" },
              { value: "CARD", label: "Card" },
              { value: "BANK_TRANSFER", label: "Bank Transfer" },
              { value: "MOBILE_MONEY", label: "Mobile Money" }
            ]}
          />

          <DateInput
            placeholder="Start Date"
            size="lg"
            value={startDate}
            onChange={(value) => setStartDate(value ? new Date(value) : null)}
            clearable
          />

          <DateInput
            placeholder="End Date"
            size="lg"
            value={endDate}
            onChange={(value) => setEndDate(value ? new Date(value) : null)}
            clearable
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Payments</Text>
          <Text className="text-4xl font-bold text-gray-900">{filteredPayments.length}</Text>
        </div>
        <div className="bg-green-50 rounded-2xl border border-green-100 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Amount</Text>
          <Text className="text-4xl font-bold text-green-600">₦{totalAmount.toLocaleString()}</Text>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Average Payment</Text>
          <Text className="text-4xl font-bold text-blue-600">
            ₦{filteredPayments.length > 0 
              ? Math.round(totalAmount / filteredPayments.length).toLocaleString() 
              : 0}
          </Text>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={<IconCash size={48} />}
          title="No payments found"
          message={searchQuery || methodFilter !== "ALL" || startDate || endDate
            ? "Try adjusting your filters"
            : "No payment transactions yet"}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <Table highlightOnHover className="text-base">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="text-base font-semibold">Date & Time</Table.Th>
                <Table.Th className="text-base font-semibold">Order Number</Table.Th>
                <Table.Th className="text-base font-semibold">Customer</Table.Th>
                <Table.Th className="text-base font-semibold">Amount</Table.Th>
                <Table.Th className="text-base font-semibold">Method</Table.Th>
                <Table.Th className="text-base font-semibold">Notes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPayments.map((payment) => (
                <Table.Tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <Table.Td>
                    <Text size="md" fw={500}>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </Text>
                    <Text size="sm" className="text-gray-500">
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md" fw={600}>{payment.order_number}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md">{payment.customer_name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md" fw={700} className="text-green-600">
                      ₦{payment.amount.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getMethodColor(payment.method)} variant="light" size="lg">
                      {getMethodLabel(payment.method)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md" className="text-gray-600" lineClamp={1}>
                      {payment.notes || "-"}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </div>
  )
}
