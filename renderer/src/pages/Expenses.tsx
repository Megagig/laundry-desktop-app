import { useState, useEffect } from "react"
import { Button, Group, Text, Table, Badge, Modal, Select, TextInput } from "@mantine/core"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Expense Tracking</h1>
          <Text className="text-lg text-gray-600">Track and manage business expenses</Text>
        </div>
        <Group>
          <Button
            size="lg"
            leftSection={<IconRefresh size={20} />}
            onClick={fetchExpenses}
            loading={isLoading}
            variant="light"
          >
            Refresh
          </Button>
          <Button
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={handleAddNew}
          >
            Add Expense
          </Button>
        </Group>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
        <Text className="text-xl font-bold text-gray-900 mb-6">Filters</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <TextInput
            placeholder="Search by title or notes"
            size="lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            placeholder="Category"
            size="lg"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value || "ALL")}
            data={[
              { value: "ALL", label: "All Categories" },
              ...EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Expenses</Text>
          <Text className="text-4xl font-bold text-gray-900">{filteredExpenses.length}</Text>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Total Amount</Text>
          <Text className="text-4xl font-bold text-red-600">₦{totalExpenses.toLocaleString()}</Text>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Average Expense</Text>
          <Text className="text-4xl font-bold text-blue-600">
            ₦{filteredExpenses.length > 0 
              ? Math.round(totalExpenses / filteredExpenses.length).toLocaleString() 
              : 0}
          </Text>
        </div>
        <div className="bg-purple-50 rounded-2xl border border-purple-100 shadow-md p-8">
          <Text className="text-md text-gray-600 font-semibold mb-2 uppercase tracking-wide">Categories</Text>
          <Text className="text-4xl font-bold text-purple-600">{Object.keys(expensesByCategory).length}</Text>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <Text className="text-xl font-bold text-gray-900 mb-6">Expense by Category</Text>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([category, amount]) => (
                <div key={category} className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <Badge color={getCategoryColor(category)} size="lg" className="mb-3">
                    {category}
                  </Badge>
                  <Text className="text-2xl font-bold text-gray-900">₦{(amount as number).toLocaleString()}</Text>
                  <Text size="sm" className="text-gray-600 font-medium mt-1">
                    {(((amount as number) / totalExpenses) * 100).toFixed(1)}%
                  </Text>
                </div>
              ))}
          </div>
        </div>
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <Table highlightOnHover className="text-base">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="text-base font-semibold">Date</Table.Th>
                <Table.Th className="text-base font-semibold">Title</Table.Th>
                <Table.Th className="text-base font-semibold">Category</Table.Th>
                <Table.Th className="text-base font-semibold">Amount</Table.Th>
                <Table.Th className="text-base font-semibold">Notes</Table.Th>
                <Table.Th style={{ width: 120 }} className="text-base font-semibold">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredExpenses.map((expense) => (
                <Table.Tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <Table.Td>
                    <Text size="md" fw={500}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md" fw={600}>{expense.title}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getCategoryColor(expense.category)} variant="light" size="lg">
                      {expense.category}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md" fw={700} className="text-red-600">
                      ₦{expense.amount.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="md" className="text-gray-600" lineClamp={1}>
                      {expense.notes || "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Button
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(expense)}
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteClick(expense)}
                      >
                        <IconTrash size={18} />
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
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
