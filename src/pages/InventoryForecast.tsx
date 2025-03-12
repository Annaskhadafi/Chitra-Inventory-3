import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
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
  Legend
);

type ForecastItem = {
  id: number;
  materialCI: string;
  materialDescription: string;
  currentStock: number;
  minimumStock: number;
  forecastedDays: number;
  dailyUsage: number;
  restockDate: string;
  status: 'critical' | 'warning' | 'good';
};

const timePeriods = [
  { value: '7', label: '7 Days' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
];

const InventoryForecast = () => {
  const [forecastItems, setForecastItems] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [selectedItem, setSelectedItem] = useState<ForecastItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Sample data for demonstration
  const sampleForecastData: ForecastItem[] = [
    {
      id: 1,
      materialCI: 'T-2055516-BFG',
      materialDescription: 'BF Goodrich 205/55/R16 All-Terrain',
      currentStock: 143,
      minimumStock: 50,
      forecastedDays: 29,
      dailyUsage: 5,
      restockDate: '2023-08-12',
      status: 'warning'
    },
    {
      id: 2,
      materialCI: 'T-2557016-MIC',
      materialDescription: 'Michelin 255/70/R16 Highway Terrain',
      currentStock: 97,
      minimumStock: 30,
      forecastedDays: 19,
      dailyUsage: 5,
      restockDate: '2023-08-05',
      status: 'warning'
    },
    {
      id: 3,
      materialCI: 'T-2157016-PIR',
      materialDescription: 'Pirelli 215/70/R16 Sport',
      currentStock: 65,
      minimumStock: 40,
      forecastedDays: 9,
      dailyUsage: 7,
      restockDate: '2023-07-27',
      status: 'critical'
    },
    {
      id: 4,
      materialCI: 'T-1957516-BST',
      materialDescription: 'Bridgestone 195/75/R16 All Season',
      currentStock: 212,
      minimumStock: 60,
      forecastedDays: 48,
      dailyUsage: 4,
      restockDate: '2023-09-08',
      status: 'good'
    },
    {
      id: 5,
      materialCI: 'T-2257517-CNT',
      materialDescription: 'Continental 225/75/R17 Winter',
      currentStock: 86,
      minimumStock: 45,
      forecastedDays: 16,
      dailyUsage: 5,
      restockDate: '2023-08-01',
      status: 'warning'
    },
  ];

  // Fetch forecast data
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from Supabase with the forecast period:
        // const { data, error } = await supabase
        //   .from('inventory')
        //   .select('*')
        //   .eq('forecast_period', forecastPeriod);
        // if (error) throw error;
        // setForecastItems(data || []);
        
        // Using sample data for demonstration
        setTimeout(() => {
          // Simulate different forecast periods
          const adjustedData = sampleForecastData.map(item => ({
            ...item,
            forecastedDays: Math.round(item.forecastedDays * (parseInt(forecastPeriod) / 30)),
            status: determineStatus(item.currentStock, item.minimumStock, item.dailyUsage, parseInt(forecastPeriod))
          }));
          setForecastItems(adjustedData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setLoading(false);
      }
    };

    fetchForecastData();
  }, [forecastPeriod]);

  // Determine status based on forecast period
  const determineStatus = (currentStock: number, minimumStock: number, dailyUsage: number, forecastPeriod: number): 'critical' | 'warning' | 'good' => {
    const daysUntilMinimum = (currentStock - minimumStock) / dailyUsage;
    
    if (daysUntilMinimum < forecastPeriod * 0.3) return 'critical';
    if (daysUntilMinimum < forecastPeriod * 0.7) return 'warning';
    return 'good';
  };

  // Filter items based on search term
  const filteredItems = forecastItems.filter((item) => {
    const searchFields = [
      item.materialCI,
      item.materialDescription,
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Chart data for trend visualization
  const generateStockTrendData = (item: ForecastItem) => {
    const days = parseInt(forecastPeriod);
    const labels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
    
    // Calculate daily stock levels based on usage rate
    const stockLevels = Array.from({ length: days }, (_, i) => {
      const projectedStock = Math.max(0, item.currentStock - (item.dailyUsage * (i + 1)));
      return projectedStock;
    });
    
    // Create a reference line for minimum stock
    const minimumStockLine = Array(days).fill(item.minimumStock);
    
    return {
      labels,
      datasets: [
        {
          label: 'Projected Stock Level',
          data: stockLevels,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.1
        },
        {
          label: 'Minimum Stock Level',
          data: minimumStockLine,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          tension: 0
        }
      ]
    };
  };

  // Generate usage history data
  const generateUsageHistoryData = () => {
    return {
      labels: ['Last Week', '2 Weeks Ago', '3 Weeks Ago', '4 Weeks Ago'],
      datasets: [
        {
          label: 'Units Used',
          data: [35, 42, 28, 39],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Level Forecast',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Stock Level'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Historical Usage',
      },
    }
  };

  const handleItemClick = (item: ForecastItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // Calculate overall inventory health
  const calculateInventoryHealth = () => {
    const criticalCount = forecastItems.filter(item => item.status === 'critical').length;
    const warningCount = forecastItems.filter(item => item.status === 'warning').length;
    const goodCount = forecastItems.filter(item => item.status === 'good').length;
    
    const totalItems = forecastItems.length;
    if (totalItems === 0) return { status: 'unknown', percentage: 0 };
    
    const healthScore = ((goodCount * 100) + (warningCount * 50)) / totalItems;
    
    if (healthScore >= 80) return { status: 'good', percentage: Math.round(healthScore) };
    if (healthScore >= 50) return { status: 'warning', percentage: Math.round(healthScore) };
    return { status: 'critical', percentage: Math.round(healthScore) };
  };

  const inventoryHealth = calculateInventoryHealth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Forecast</h1>
        <div className="flex space-x-2">
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {timePeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by material code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Inventory Health Summary */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Inventory Health</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="col-span-1 md:col-span-3">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Overall Health: {inventoryHealth.percentage}%</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                inventoryHealth.status === 'good' ? 'bg-green-100 text-green-800' :
                inventoryHealth.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {inventoryHealth.status === 'good' ? 'Good' :
                 inventoryHealth.status === 'warning' ? 'Needs Attention' :
                 'Critical'}
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full">
              <div 
                className={`h-4 rounded-full ${
                  inventoryHealth.status === 'good' ? 'bg-green-500' :
                  inventoryHealth.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${inventoryHealth.percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-xl font-bold text-red-700">
                {forecastItems.filter(i => i.status === 'critical').length}
              </div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-700">
                {forecastItems.filter(i => i.status === 'warning').length}
              </div>
              <div className="text-xs text-yellow-600">Warning</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-xl font-bold text-green-700">
                {forecastItems.filter(i => i.status === 'good').length}
              </div>
              <div className="text-xs text-green-600">Good</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast table */}
      <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Material</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Daily Usage</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Days Until Minimum</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading forecast data...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No forecast items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.materialCI}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.materialDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.minimumStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.dailyUsage} units/day</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.forecastedDays} days</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${item.status === 'good' ? 'bg-green-100 text-green-800' : 
                      item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                      {item.status === 'good' ? 'Good' : 
                       item.status === 'warning' ? 'Warning' : 
                       'Critical'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Forecast: ${selectedItem.materialDescription}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Material Code</h3>
                <p className="mt-1 text-lg font-semibold">{selectedItem.materialCI}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${selectedItem.status === 'good' ? 'bg-green-100 text-green-800' : 
                    selectedItem.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                    {selectedItem.status === 'good' ? 'Good' : 
                    selectedItem.status === 'warning' ? 'Warning' : 
                    'Critical'}
                  </span>
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Current Stock</h3>
                <p className="mt-1 text-lg font-semibold">{selectedItem.currentStock} units</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Minimum Stock</h3>
                <p className="mt-1 text-lg font-semibold">{selectedItem.minimumStock} units</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Daily Usage Rate</h3>
                <p className="mt-1 text-lg font-semibold">{selectedItem.dailyUsage} units/day</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Recommended Restock Date</h3>
                <p className="mt-1 text-lg font-semibold">{selectedItem.restockDate}</p>
              </div>
            </div>
            
            <div className="h-64">
              <Line 
                options={lineOptions} 
                data={generateStockTrendData(selectedItem)} 
                height={80} 
              />
            </div>
            
            <div className="h-64">
              <Bar 
                options={barOptions} 
                data={generateUsageHistoryData()} 
                height={80} 
              />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800">Recommendations</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc pl-5">
                {selectedItem.status === 'critical' && (
                  <>
                    <li>Place emergency order for {selectedItem.materialDescription}</li>
                    <li>Consider expedited shipping options</li>
                    <li>Verify usage rates with warehouse staff</li>
                  </>
                )}
                {selectedItem.status === 'warning' && (
                  <>
                    <li>Schedule restock order within the next 7 days</li>
                    <li>Review historical demand patterns for this item</li>
                    <li>Consider adjusting minimum stock level</li>
                  </>
                )}
                {selectedItem.status === 'good' && (
                  <>
                    <li>Maintain current inventory management approach</li>
                    <li>Consider bulk order discounts if storage permits</li>
                    <li>Evaluate if minimum stock level can be reduced</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryForecast;
