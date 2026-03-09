import { useState, useEffect } from "react"
import { Button, Group, Text, Card, Table, Badge, Modal, Select, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconPlus, IconRefresh, IconEdit, IconTrash, IconReceipt } from "@tabler/icons-react"
import { LoadingSpinner, EmptyState, ConfirmDialog } from "../components/common"
import { ExpenseForm } from "../components/forms"

const EXPENSE_CATEGORIES = [
  "Detergent",
  "Electricity",
  "Fuel",
  "Staff Salary",
  "Machine Repair",
  "Rent",
  "Water",
  "Marketing",
  "Other"
]

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    filterExpenses()
  }, [expenses, searchQuery, categoryFilter, startDate, endDate])

  const fetchExpenses = async () => {
    setIsLoading(true)
    try {
      const result = await window.api.expense.getAll(1000)
      if (result.success) {
        setExpenses(result.data)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterExpenses = () => {
    let filtered = [...expenses]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (expense) =>
          expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((expense) => expense.category === categoryFilter)
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (expense) => new Date(expense.date) >= startDate
      )
    }
    if (endDate) {
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      filtered = filtered.filter(
        (expense) => new Date(expense.date) <= endOfDay
      )
    }

    setFilteredExpenses(filtered)
  }

  const handleAddNew = () => {
    setSelectedExpense(null)
    setIsFormOpen(true)
  }

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (expense: any) => {
    setExpenseToDelete(expense)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      try {
        await window.api.expense.delete(expenseToDelete.id)
        setDeleteConfirmOpen(false)
        setExpenseToDelete(null)
        fetchExpenses()
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedExpense(null)
    fetchExpenses()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedExpense(null)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Detergent": "blue",
      "Electricity": "yellow",
      "Fuel": "orange",
      "Staff Salary": "green",
      "Machine Repair": "red",
      "Rent": "violet",
      "Water": "cyan",
      "Marketing": "pink",
      "Other": "gray"
    }
    return colors[category] || "gray"
  }

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Group expenses by category for summary
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || "Other"
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += expense.amount
    return acc
  }, {} as Record<string, number>)

  if (isLoading && expenses.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracking</h1>
          <Text size="sm" c="dimmed">Track and manage business expenses</Text>
        </div>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={fetchExpenses}
            loading={isLoading}
            variant="light"
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddNew}
          >
            Add Expense
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card withBorder>
        <Text size="sm" fw={600} className="mb-3">Filters</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextInput
            placeholder="Search by title or notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            placeholder="Category"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value || "ALL")}
            data={[
              { value: "ALL", label: "All Categories" },
              ...EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card withBorder>
          <Text size="sm" c="dimmed">Total Expenses</Text>
          <Text size="xl" fw={700}>{filteredExpenses.length}</Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">Total Amount</Text>
          <Text size="xl" fw={700} c="red">₦{totalExpenses.toLocaleString()}</Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">Average Expense</Text>
          <Text size="xl" fw={700}>
            ₦{filteredExpenses.length > 0 
              ? Math.round(totalExpenses / filteredExpenses.length).toLocaleString() 
              : 0}
          </Text>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">Categories</Text>
          <Text size="xl" fw={700}>{Object.keys(expensesByCategory).length}</Text>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card withBorder>
          <Text size="sm" fw={600} className="mb-3">Expense by Category</Text>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([category, amount]) => (
                <div key={category} className="p-3 bg-gray-50 rounded">
                  <Badge color={getCategoryColor(category)} size="sm" className="mb-1">
                    {category}
                  </Badge>
                  <Text size="lg" fw={700}>₦{(amount as number).toLocaleString()}</Text>
                  <Text size="xs" c="dimmed">
                    {(((amount as number) / totalExpenses) * 100).toFixed(1)}%
                  </Text>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={<IconReceipt size={48} />}
          title="No expenses found"
          message={searchQuery || categoryFilter !== "ALL" || startDate || endDate
            ? "Try adjusting your filters"
            : "No expenses recorded yet"}
          actionLabel="Add Expense"
          onAction={handleAddNew}
        />
      ) : (
        <Card withBorder>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredExpenses.map((expense) => (
                <Table.Tr key={expense.id}>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>{expense.title}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getCategoryColor(expense.category)} variant="light">
                      {expense.category}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="red">
                      ₦{expense.amount.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {expense.notes || "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(expense)}
                      >
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteClick(expense)}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* Expense Form Modal */}
      <Modal
        opened={isFormOpen}
        onClose={handleFormCancel}
        title={selectedExpense ? "Edit Expense" : "Add New Expense"}
        size="md"
      >
        <ExpenseForm
          expense={selectedExpense}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expenseToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  )
}
