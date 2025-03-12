import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Modal from '../components/Modal';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

type CostSummary = {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
};

type DateRange = {
  startDate: string;
  endDate: string;
};

const CostAnalysis = () => {
  const [period, setPeriod] = useState('monthly');
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const costSummaries: CostSummary[] = [
    { 
      title: 'Total Delivery Cost', 
      value: 'Rp 128,250', 
      change: '+5.4%', 
      icon: DollarSign,
      trend: 'up'
    },
    { 
      title: 'Average Cost per Delivery', 
      value: 'Rp 532', 
      change: '-2.1%', 
      icon: TrendingDown,
      trend: 'down'
    },
    { 
      title: 'Fuel Expenses', 
      value: 'Rp 42,380', 
      change: '+8.7%', 
      icon: TrendingUp,
      trend: 'up'
    },
    { 
      title: 'Maintenance Costs', 
      value: 'Rp 15,470', 
      change: '-3.5%', 
      icon: TrendingDown,
      trend: 'down'
    },
  ];

  // Monthly cost trend data
  const monthlyCostData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Delivery Costs (Rp)',
        data: [95000, 88000, 105000, 112000, 98000, 103000, 118000, 110000, 122000, 128000, 125000, 135000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Cost by category data
  const costByCategory = {
    labels: ['Fuel', 'Labor', 'Maintenance', 'Insurance', 'Tolls', 'Other'],
    datasets: [
      {
        label: 'Cost by Category (Rp)',
        data: [42380, 48500, 15470, 12300, 5600, 4000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Cost by destination data
  const costByDestination = {
    labels: ['South Region Hub', 'Eastern Warehouse', 'City Retail Store', 'Western Distribution', 'Northern Outlet'],
    datasets: [
      {
        label: 'Cost per Delivery (Rp)',
        data: [620, 480, 350, 750, 510],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Options for charts
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Delivery Costs Trend',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average Cost by Destination',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cost Distribution by Category',
      },
    },
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleDateRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would fetch data for the selected date range
    // For demo purposes, we'll just close the modal
    setIsDateRangeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cost Analysis</h1>
        <div className="flex space-x-2">
          <select
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button 
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setIsDateRangeModalOpen(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </button>
        </div>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {costSummaries.map((item, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-md ${
                item.trend === 'down' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <item.icon className={`w-6 h-6 ${
                  item.trend === 'down' ? 'text-green-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">{item.title}</h2>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <p className={`text-sm ${
                  item.trend === 'down' && item.change.startsWith('-') ? 'text-green-600' : 
                  item.trend === 'up' && item.change.startsWith('+') ? 'text-blue-600' : 
                  item.trend === 'down' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.change} from last period
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <Line options={lineOptions} data={monthlyCostData} />
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <Bar options={barOptions} data={costByDestination} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <Doughnut options={doughnutOptions} data={costByCategory} />
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Cost Reduction Opportunities</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-md border-yellow-400 bg-yellow-50">
              <h3 className="font-medium text-yellow-800">Route Optimization</h3>
              <p className="mt-1 text-sm text-gray-700">
                Optimizing delivery routes could save up to 12% in fuel costs. Consider implementing route planning software.
              </p>
            </div>
            <div className="p-4 border rounded-md border-green-400 bg-green-50">
              <h3 className="font-medium text-green-800">Maintenance Schedule</h3>
              <p className="mt-1 text-sm text-gray-700">
                Regular preventive maintenance can reduce repair costs by 30%. Update maintenance schedules for all vehicles.
              </p>
            </div>
            <div className="p-4 border rounded-md border-blue-400 bg-blue-50">
              <h3 className="font-medium text-blue-800">Bulk Fuel Purchasing</h3>
              <p className="mt-1 text-sm text-gray-700">
                Negotiating bulk fuel contracts could reduce per-gallon costs by 5-8%. Review current supplier agreements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      <Modal
        isOpen={isDateRangeModalOpen}
        onClose={() => setIsDateRangeModalOpen(false)}
        title="Select Date Range"
        size="sm"
      >
        <form onSubmit={handleDateRangeSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min={dateRange.startDate}
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Apply
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setIsDateRangeModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CostAnalysis;
