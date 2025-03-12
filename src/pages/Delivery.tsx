import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, CircleAlert, Clock, Filter, Search } from 'lucide-react';
import Modal from '../components/Modal';

type DeliveryStatus = 'pending' | 'in-transit' | 'delayed' | 'delivered';

type Delivery = {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  estimatedArrival: string;
  status: DeliveryStatus;
  items: number;
  weight: string;
};

const statusLabels: Record<DeliveryStatus, { label: string, color: string }> = {
  'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  'in-transit': { label: 'In Transit', color: 'bg-blue-100 text-blue-800' },
  'delayed': { label: 'Delayed', color: 'bg-red-100 text-red-800' },
  'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
};

const Delivery = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Delivery>>({
    trackingNumber: '',
    origin: '',
    destination: '',
    departureDate: '',
    estimatedArrival: '',
    status: 'pending',
    items: 0,
    weight: '',
  });

  // Sample data for demonstration
  const sampleDeliveries: Delivery[] = [
    {
      id: '1',
      trackingNumber: 'TR-7896',
      origin: 'Main Distribution Center',
      destination: 'South Region Hub',
      departureDate: '2023-07-15',
      estimatedArrival: '2023-07-18',
      status: 'delayed',
      items: 145,
      weight: '1,240 kg'
    },
    {
      id: '2',
      trackingNumber: 'TR-8532',
      origin: 'North Distribution Hub',
      destination: 'Eastern Warehouse',
      departureDate: '2023-07-16',
      estimatedArrival: '2023-07-17',
      status: 'delivered',
      items: 78,
      weight: '680 kg'
    },
    {
      id: '3',
      trackingNumber: 'TR-9237',
      origin: 'Supplier Factory',
      destination: 'Main Distribution Center',
      departureDate: '2023-07-17',
      estimatedArrival: '2023-07-20',
      status: 'in-transit',
      items: 210,
      weight: '1,850 kg'
    },
    {
      id: '4',
      trackingNumber: 'TR-6327',
      origin: 'South Region Hub',
      destination: 'City Retail Store',
      departureDate: '2023-07-18',
      estimatedArrival: '2023-07-19',
      status: 'pending',
      items: 32,
      weight: '320 kg'
    },
    {
      id: '5',
      trackingNumber: 'TR-5891',
      origin: 'International Supplier',
      destination: 'Main Distribution Center',
      departureDate: '2023-07-12',
      estimatedArrival: '2023-07-22',
      status: 'in-transit',
      items: 315,
      weight: '2,740 kg'
    },
  ];

  // Fetch delivery data
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from Supabase:
        // const { data, error } = await supabase.from('deliveries').select('*');
        // if (error) throw error;
        // setDeliveries(data || []);
        
        // Using sample data for demonstration
        setTimeout(() => {
          setDeliveries(sampleDeliveries);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Filter deliveries based on search term
  const filteredDeliveries = deliveries.filter((delivery) => {
    const searchFields = [
      delivery.trackingNumber,
      delivery.origin,
      delivery.destination,
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'items' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrackingNumber = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDelivery: Delivery = {
      ...formData as Omit<Delivery, 'id' | 'trackingNumber'>,
      id: Date.now().toString(),
      trackingNumber: formData.trackingNumber || newTrackingNumber,
    };
    setDeliveries([...deliveries, newDelivery]);
    setIsModalOpen(false);
  };

  const handleCreateShipment = () => {
    setFormData({
      trackingNumber: '',
      origin: '',
      destination: '',
      departureDate: '',
      estimatedArrival: '',
      status: 'pending',
      items: 0,
      weight: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Tracking</h1>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleCreateShipment}
          >
            Create Shipment
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by tracking number, origin, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Status
          </button>
        </div>
      </div>

      {/* Delivery status summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusLabels).map(([status, { label, color }]) => (
          <div key={status} className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${color.split(' ')[0]}`}>
                {status === 'pending' && <Clock className="w-5 h-5" />}
                {status === 'in-transit' && <Calendar className="w-5 h-5" />}
                {status === 'delayed' && <CircleAlert className="w-5 h-5" />}
                {status === 'delivered' && <Calendar className="w-5 h-5" />}
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">{label}</h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {deliveries.filter(d => d.status === status).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deliveries table */}
      <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tracking #</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Origin</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Destination</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Departure</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Est. Arrival</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Weight</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading delivery data...
                </td>
              </tr>
            ) : filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No deliveries found.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {delivery.trackingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.departureDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.estimatedArrival}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusLabels[delivery.status].color}`}>
                      {statusLabels[delivery.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.weight}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Shipment"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Main Distribution Center"
                required
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="South Region Hub"
                required
              />
            </div>
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">Departure Date</label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="estimatedArrival" className="block text-sm font-medium text-gray-700">Estimated Arrival</label>
              <input
                type="date"
                id="estimatedArrival"
                name="estimatedArrival"
                value={formData.estimatedArrival}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delayed">Delayed</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div>
              <label htmlFor="items" className="block text-sm font-medium text-gray-700">Number of Items</label>
              <input
                type="number"
                id="items"
                name="items"
                value={formData.items}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="1"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight</label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="1,240 kg"
                required
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Create Shipment
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Delivery;
