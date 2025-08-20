import { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiUsers, 
  FiCheckCircle,
  FiPieChart,
  FiTrendingUp,
  FiAlertCircle,
  FiUserPlus,
  FiUserCheck
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { fetchBookings, fetchPayments, fetchClientList } from '../services/Api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/dashboardLayout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

// Move all data processing functions before the component
const processRevenueData = (payments) => {
  const monthlyRevenue = payments.reduce((acc, payment) => {
    if (payment.status === 'Completed') {
      const month = new Date(payment.payment_date).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.revenue += payment.amount_paid;
      } else {
        acc.push({ month, revenue: payment.amount_paid });
      }
    }
    return acc;
  }, []);

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);

  const monthOverMonthChange = monthlyRevenue.length > 1 
    ? ((monthlyRevenue[monthlyRevenue.length - 1].revenue - 
        monthlyRevenue[monthlyRevenue.length - 2].revenue) / 
        monthlyRevenue[monthlyRevenue.length - 2].revenue) * 100 
    : 0;

  return { monthlyRevenue, totalRevenue, monthOverMonthChange };
};

const processBookingTrends = (bookings) => {
  const monthlyBookings = bookings.reduce((acc, booking) => {
    const month = new Date(booking.date_booked).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.bookings += 1;
    } else {
      acc.push({ month, bookings: 1 });
    }
    return acc;
  }, []);

  const monthOverMonthChange = monthlyBookings.length > 1 
    ? ((monthlyBookings[monthlyBookings.length - 1].bookings - 
        monthlyBookings[monthlyBookings.length - 2].bookings) / 
        monthlyBookings[monthlyBookings.length - 2].bookings) * 100 
    : 0;

  return { monthlyBookings, monthOverMonthChange };
};

const processPackageDistribution = (bookings) => {
  const packageCounts = {};
  bookings.forEach(booking => {
    booking.packages.forEach(pkg => {
      packageCounts[pkg.package_name] = (packageCounts[pkg.package_name] || 0) + 1;
    });
  });

  return Object.entries(packageCounts).map(([name, value]) => ({ name, value }));
};

const processPaymentStatus = (payments) => {
  const statusCounts = {};
  payments.forEach(payment => {
    statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
};

const processUserAnalytics = (clients) => {
  const monthlyClients = clients.reduce((acc, client) => {
    const month = new Date(client.join_date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.clients += 1;
    } else {
      acc.push({ month, clients: 1 });
    }
    return acc;
  }, []);

  const monthOverMonthChange = monthlyClients.length > 1 
    ? ((monthlyClients[monthlyClients.length - 1].clients - 
        monthlyClients[monthlyClients.length - 2].clients) / 
        monthlyClients[monthlyClients.length - 2].clients * 100 )
    : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeClients = clients.filter(client => 
    new Date(client.last_active) > thirtyDaysAgo
  ).length;

  const currentMonth = new Date().getMonth();
  const newClientsThisMonth = clients.filter(client => 
    new Date(client.join_date).getMonth() === currentMonth
  ).length;

  return { 
    monthlyClients, 
    monthOverMonthChange, 
    activeClients,
    newClientsThisMonth
  };
};

const processTopSpendingClients = (clients, bookings) => {
  return clients.map(client => {
    const clientBookings = bookings.filter(b => b.client.id === client.id);
    const totalSpent = clientBookings.reduce((sum, booking) => {
      return sum + (booking.total_amount || 0);
    }, 0);
    
    return {
      id: client.id,
      name: client.name,
      totalSpent,
      bookingsCount: clientBookings.length
    };
  })
  .sort((a, b) => b.totalSpent - a.totalSpent);
};

const processClientSources = (clients) => {
  const sources = {};
  clients.forEach(client => {
    const source = client.source || 'Unknown';
    sources[source] = (sources[source] || 0) + 1;
  });

  return Object.entries(sources).map(([source, count]) => ({
    source,
    count
  }));
};

// Helper components
const MetricCard = ({ icon, title, value, change, percentage }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-gray-100 mr-4">
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
          {percentage !== undefined && (
            <p className="text-sm text-gray-500">
              {percentage}% of total clients
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="mr-2">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// Main component
export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingsData, paymentsData, clientsData] = await Promise.all([
          fetchBookings(),
          fetchPayments(),
          fetchClientList()
        ]);
        setBookings(bookingsData);
        setPayments(paymentsData);
        setClients(clientsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

 if (loading) {
    return (<>
       <Navbar/>
      <div className="flex justify-center items-center h-screen">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b683]"></div>
      </div>
      </>
    );
  }
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  // Process data for charts
  const revenueData = processRevenueData(payments);
  const bookingTrends = processBookingTrends(bookings);
  const packageDistribution = processPackageDistribution(bookings);
  const paymentStatusData = processPaymentStatus(payments);
  const upcomingEvents = bookings.filter(b => new Date(b.wedding_date) > new Date()).length;
  const userAnalytics = processUserAnalytics(clients);
  const repeatClients = bookings.filter(b => 
    clients.some(c => c.id === b.client.id && c.bookings.length > 1)
  ).length;

  return (
    <>
    <Navbar/>
    <div className="flex h-screen bg-gray-100">
      <div className="fixed h-screen">
          <DashboardLayout />
        </div>

    {/* Scrollable Main Content */}
        <div 
           className="flex-1 md:ml-64 p-4 overflow-y-auto"
          style={{ 
            height: 'calc(100vh - 4rem)', // Adjust based on Navbar height
            width: '100%', // Ensure full width on mobile
          }}
        >
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-center font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      {/* Key Metrics Cards - Updated with User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          icon={<FiDollarSign className="text-blue-500" size={24} />}
          title="Total Revenue"
          value={`$${revenueData.totalRevenue.toLocaleString()}`}
          change={revenueData.monthOverMonthChange}
        />
        <MetricCard 
          icon={<FiCalendar className="text-green-500" size={24} />}
          title="Total Bookings"
          value={bookings.length}
          change={bookingTrends.monthOverMonthChange}
        />
        <MetricCard 
          icon={<FiUsers className="text-purple-500" size={24} />}
          title="Total Clients"
          value={clients.length}
          change={userAnalytics.monthOverMonthChange}
        />
        <MetricCard 
          icon={<FiUserCheck className="text-teal-500" size={24} />}
          title="Repeat Clients"
          value={repeatClients}
          percentage={clients.length > 0 ? (repeatClients / clients.length * 100).toFixed(1) : 0}
        />
      </div>

      {/* Charts Section - Updated with User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend Chart */}
        <ChartCard title="Revenue Trend" icon={<FiTrendingUp />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Growth Chart - NEW */}
        <ChartCard title="Client Growth" icon={<FiUserPlus />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userAnalytics.monthlyClients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="clients" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Package Distribution */}
        <ChartCard title="Package Distribution" icon={<FiPieChart />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={packageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {packageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Types - NEW */}
        <ChartCard title="Client Types" icon={<FiUsers />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'New Clients', value: clients.length - repeatClients },
                  { name: 'Repeat Clients', value: repeatClients }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#FF6B6B" />
                <Cell fill="#00C49F" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Additional User Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Top Spending Clients - NEW */}
        <ChartCard title="Top Spending Clients" icon={<FiDollarSign />}>
          <div className="space-y-4">
            {processTopSpendingClients(clients, bookings).slice(0, 5).map((client, index) => (
              <div key={client.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{client.name}</span>
                </div>
                <span className="font-semibold">${client.totalSpent.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Client Acquisition Channels - NEW */}
        <ChartCard title="Client Sources" icon={<FiUsers />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processClientSources(clients)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Activity - NEW */}
        <ChartCard title="Client Activity" icon={<FiUserCheck />}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Clients (last 30 days):</span>
              <span className="font-semibold">{userAnalytics.activeClients}</span>
            </div>
            <div className="flex justify-between">
              <span>New Clients (this month):</span>
              <span className="font-semibold">{userAnalytics.newClientsThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Bookings per Client:</span>
              <span className="font-semibold">
                {clients.length > 0 ? (bookings.length / clients.length).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </ChartCard>
      </div></div>
    </div></div></>
  );
}

