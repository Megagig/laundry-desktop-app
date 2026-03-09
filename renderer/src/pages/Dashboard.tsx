import { useEffect, useState } from "react"
import { Button, Group, Text, Card, Table, Badge, ActionIcon } from "@mantine/core"
import { 
  IconRefresh, 
  IconPlus, 
  IconReceipt, 
  IconUsers, 
  IconCash, 
  IconAlertCircle,
  IconTrendingUp,
  IconEye
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { useReportStore, useOrderStore } from "../store"
import { StatCard, LoadingSpinner, ErrorMessage, StatusBadge, EmptyState } from "../components/common"

export default function Dashboard() {
  const navigate = useNavigate()
  const { 
    dashboardMetrics, 
    isLoading, 
    error,
    refreshDashboard 
  } = useReportStore()

  const { orders, fetchOrders } = useOrderStore()
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    await refreshDashboard()
    await fetchOrders()
  }

  useEffect(() => {
    // Get 5 most recent orders
    if (orders.length > 0) {
      const sorted = [...orders].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setRecentOrders(sorted.slice(0, 5))
    }
  }, [orders])

  const handleRefresh = async () => {
    await loadDashboardData()
  }

  const pendingPickups = orders.filter(o => o.status === "READY")

  if (isLoading && !dashboardMetrics) {
    return <LoadingSpinner fullScreen />
  }

  if (error && !dashboardMetrics) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Text size="sm" c="dimmed">Welcome to Laundry Manager</Text>
        </div>
        <Group>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/orders/new")}
          >
            New Order
          </Button>
          <ActionIcon 
            variant="light" 
            size="lg"
            onClick={handleRefresh}
            loading={isLoading}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Orders Today"
          value={dashboardMetrics?.total_orders_today || 0}
          icon={<IconReceipt size={24} />}
          color="blue"
        />
        <StatCard
          title="Revenue Today"
          value={`₦${(dashboardMetrics?.revenue_today || 0).toLocaleString()}`}
          icon={<IconCash size={24} />}
          color="green"
        />
        <StatCard
          title="Outstanding Payments"
          value={`₦${(dashboardMetrics?.outstanding_payments || 0).toLocaleString()}`}
          icon={<IconAlertCircle size={24} />}
          color="red"
        />
        <StatCard
          title="Ready for Pickup"
          value={dashboardMetrics?.orders_ready_for_pickup || 0}
          icon={<IconUsers size={24} />}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Customers"
          value={dashboardMetrics?.total_customers || 0}
          icon={<IconUsers size={24} />}
          color="violet"
        />
        <StatCard
          title="Orders In Progress"
          value={dashboardMetrics?.orders_in_progress || 0}
          icon={<IconTrendingUp size={24} />}
          color="cyan"
        />
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Widget */}
        <Card withBorder>
          <Group justify="space-between" className="mb-4">
            <Text size="lg" fw={600}>Recent Orders</Text>
            <Button 
              variant="subtle" 
              size="xs"
              onClick={() => navigate("/orders")}
            >
              View All
            </Button>
          </Group>

          {recentOrders.length === 0 ? (
            <EmptyState
              icon={<IconReceipt size={48} />}
              title="No orders yet"
              message="Create your first order to get started"
              actionLabel="Create Order"
              onAction={() => navigate("/orders/new")}
            />
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order #</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentOrders.map(order => (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{order.order_number}</Text>
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={order.status} />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">₦{order.total_amount.toLocaleString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="subtle" 
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>

        {/* Pending Pickups Widget */}
        <Card withBorder>
          <Group justify="space-between" className="mb-4">
            <Text size="lg" fw={600}>Pending Pickups</Text>
            <Badge color="orange" variant="light">
              {pendingPickups.length}
            </Badge>
          </Group>

          {pendingPickups.length === 0 ? (
            <EmptyState
              icon={<IconUsers size={48} />}
              title="No pending pickups"
              message="All orders have been collected"
            />
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order #</Table.Th>
                  <Table.Th>Pickup Date</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pendingPickups.slice(0, 5).map(order => (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{order.order_number}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {new Date(order.pickup_date).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        size="sm" 
                        c={order.balance > 0 ? "red" : "green"}
                        fw={order.balance > 0 ? 600 : 400}
                      >
                        ₦{order.balance.toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="subtle" 
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card withBorder>
        <Text size="lg" fw={600} className="mb-4">Quick Actions</Text>
        <Group>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/orders/new")}
          >
            New Order
          </Button>
          <Button 
            variant="light"
            leftSection={<IconUsers size={16} />}
            onClick={() => navigate("/customers")}
          >
            Manage Customers
          </Button>
          <Button 
            variant="light"
            leftSection={<IconReceipt size={16} />}
            onClick={() => navigate("/orders")}
          >
            View All Orders
          </Button>
        </Group>
      </Card>
    </div>
  )
}