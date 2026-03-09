import { useState, useEffect } from "react"
import { Button, Group, Text, Card, Table, Badge, Select, TextInput } from "@mantine/core"
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
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Payment History</h1>
          <Text size="sm" c="dimmed">View and manage all payment transactions</Text>
        </div>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={fetchPayments}
          loading={isLoading}
          variant="light"
        >
          Refresh
        </Button>
      </Group>

      {/* Filters */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Filters</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            placeholder="Search by order or customer"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            placeholder="Payment Method"
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
            value={startDate}
            onChange={(value) => setStartDate(value ? new Date(value) : null)}
            clearable
          />

          <DateInput
            placeholder="End Date"
            value={endDate}
            onChange={(value) => setEndDate(value ? new Date(value) : null)}
            clearable
          />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card withBorder>
          <Text size="sm" c="dimmed">Total Payments</Text>
          <Text size="xl" fw={700}>{filteredPayments.length}</Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">Total Amount</Text>
          <Text size="xl" fw={700} c="green">₦{totalAmount.toLocaleString()}</Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">Average Payment</Text>
          <Text size="xl" fw={700}>
            ₦{filteredPayments.length > 0 
              ? Math.round(totalAmount / filteredPayments.length).toLocaleString() 
              : 0}
          </Text>
        </Card>
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
        <Card withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date & Time</Table.Th>
                <Table.Th>Order Number</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Method</Table.Th>
                <Table.Th>Notes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPayments.map((payment) => (
                <Table.Tr key={payment.id}>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>{payment.order_number}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{payment.customer_name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="green">
                      ₦{payment.amount.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getMethodColor(payment.method)} variant="light">
                      {getMethodLabel(payment.method)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {payment.notes || "-"}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </div>
  )
}
