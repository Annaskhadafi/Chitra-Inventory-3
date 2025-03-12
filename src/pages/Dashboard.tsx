import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Archive, ShoppingCart, Squircle, TrendingUp, Truck } from 'lucide-react';

type DashboardStat = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  color: string;
};

type AlertItem = {
  id: number;
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info';
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStat[]>([
    { title: 'Total Inventory', value: '12,453', change: '+2.5%', icon: Archive, color: 'bg-blue-500' },
    { title: 'Pending Deliveries', value: 78, change: '+5.0%', icon: Truck, color: 'bg-yellow-500' },
    { title: 'Low Stock Items', value: 23, change: '-7.8%', icon: ShoppingCart, color: 'bg-red-500' },
    { title: 'Monthly Turnover', value: 'Rp 238,467', change: '+12.3%', icon: TrendingUp, color: 'bg-green-500' },
  ]);
  
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, title: 'Low Stock Alert', description: 'BF Goodrich 255/70R16 is below reorder level', type: 'warning' },
    { id: 2, title: 'Delivery Delayed', description: 'Shipment #TR-7896 is delayed by 2 days', type: 'error' },
    { id: 3, title: 'New Price Update', description: 'Price updates available for 128 items', type: 'info' },
    { id: 4, title: 'Warehouse Capacity', description: 'West Zone reaching 85% capacity', type: 'warning' },
  ]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, we would fetch this data from Supabase
        // const { data: inventoryData } = await supabase.from('inventory_summary').select('*');
        // Then update the stats with the real data
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Export Report
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-md ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">{stat.title}</h2>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Alerts</h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 border rounded-md ${
                alert.type === 'warning' ? 'border-yellow-400 bg-yellow-50' : 
                alert.type === 'error' ? 'border-red-400 bg-red-50' : 
                'border-blue-400 bg-blue-50'
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <Squircle className={`w-5 h-5 ${
                    alert.type === 'warning' ? 'text-yellow-400' : 
                    alert.type === 'error' ? 'text-red-400' : 
                    'text-blue-400'
                  }`} />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{alert.title}</h3>
                  <div className="mt-1 text-sm text-gray-700">
                    {alert.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="overflow-hidden border-b border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Activity</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Stock update for Continental 205/55R16</td>
                <td className="px-6 py-4 whitespace-nowrap">John Smith</td>
                <td className="px-6 py-4 whitespace-nowrap">10 minutes ago</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Delivery #TR-8532 completed</td>
                <td className="px-6 py-4 whitespace-nowrap">Sarah Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap">1 hour ago</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">New order #PO-3948 created</td>
                <td className="px-6 py-4 whitespace-nowrap">Mike Davis</td>
                <td className="px-6 py-4 whitespace-nowrap">3 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
