import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Box, Clipboard, Map, Package, Search } from 'lucide-react';
import Modal from '../components/Modal';
import WarehouseForm from '../components/WarehouseForm';

type WarehouseSection = {
  id: string;
  name: string;
  capacity: number;
  utilized: number;
  itemCount: number;
  lastUpdated: string;
  warehouseName?: string;
  plant?: string;
  location?: string;
  pic?: string;
};

const Warehouse = () => {
  const [warehouseSections, setWarehouseSections] = useState<WarehouseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample data for demonstration
  const sampleSections: WarehouseSection[] = [
    {
      id: '1',
      name: 'Zone A - Passenger Tires',
      capacity: 5000,
      utilized: 3250,
      itemCount: 1450,
      lastUpdated: '2023-07-15 09:23'
    },
    {
      id: '2',
      name: 'Zone B - Truck Tires',
      capacity: 3000,
      utilized: 2680,
      itemCount: 780,
      lastUpdated: '2023-07-16 14:45'
    },
    {
      id: '3',
      name: 'Zone C - Premium Tires',
      capacity: 2500,
      utilized: 980,
      itemCount: 420,
      lastUpdated: '2023-07-17 11:30'
    },
    {
      id: '4',
      name: 'Zone D - Special Sizes',
      capacity: 1800,
      utilized: 1200,
      itemCount: 530,
      lastUpdated: '2023-07-15 16:15'
    },
    {
      id: '5',
      name: 'Zone E - Seasonal Stock',
      capacity: 2200,
      utilized: 1870,
      itemCount: 820,
      lastUpdated: '2023-07-14 10:20'
    },
  ];

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from Supabase:
        // const { data, error } = await supabase.from('warehouse_sections').select('*');
        // if (error) throw error;
        // setWarehouseSections(data || []);

        // Using sample data for demonstration
        setTimeout(() => {
          setWarehouseSections(sampleSections);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, []);

  const handleAddSection = (newSection: { warehouseName: string; plant: string; location: string; pic: string }) => {
    const newId = (warehouseSections.length + 1).toString();
    const updatedSections = [
      ...warehouseSections,
      {
        id: newId,
        name: newSection.warehouseName, // Use warehouseName for the zone's name
        capacity: 0, // Default or you can modify WarehouseForm to include capacity
        utilized: 0,
        itemCount: 0,
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
        warehouseName: newSection.warehouseName,
        plant: newSection.plant,
        location: newSection.location,
        pic: newSection.pic,
      },
    ];
    setWarehouseSections(updatedSections);
  };

  // Calculate total stats
  const totalCapacity = warehouseSections.reduce((sum, section) => sum + section.capacity, 0);
  const totalUtilized = warehouseSections.reduce((sum, section) => sum + section.utilized, 0);
  const utilizationPercentage = totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0;
  const totalItems = warehouseSections.reduce((sum, section) => sum + section.itemCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => setIsModalOpen(true)}
          >
            Add Zone
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Generate Report
          </button>
        </div>
      </div>

      {/* Warehouse overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Capacity</h2>
              <p className="text-2xl font-semibold text-gray-900">{totalCapacity.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-md">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Space Utilized</h2>
              <p className="text-2xl font-semibold text-gray-900">{utilizationPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-md">
              <Clipboard className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Items</h2>
              <p className="text-2xl font-semibold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-md">
              <Map className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Warehouse Zones</h2>
              <p className="text-2xl font-semibold text-gray-900">{warehouseSections.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse sections */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Warehouse Zones</h2>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search zones..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500">Loading warehouse data...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {warehouseSections.map((section) => {
              const utilPercent = Math.round((section.utilized / section.capacity) * 100);
              let bgColor = '';
              if (utilPercent >= 90) {
                bgColor = 'bg-red-500';
              } else if (utilPercent >= 70) {
                bgColor = 'bg-yellow-500';
              } else {
                bgColor = 'bg-green-500';
              }

              return (
                <div key={section.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                      <p className="text-sm text-gray-500">Last updated: {section.lastUpdated}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {section.itemCount} items
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Space Utilization: {utilPercent}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {section.utilized.toLocaleString()} / {section.capacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${bgColor}`}
                        style={{ width: `${utilPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Warehouse Zone"
      >
        <WarehouseForm onClose={() => setIsModalOpen(false)} onSubmit={handleAddSection} />
      </Modal>
    </div>
  );
};

export default Warehouse;
