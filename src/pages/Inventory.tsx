import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { InventoryItem } from '../lib/types';

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    plnt: '',
    plantName: '',
    materialCI: '',
    oldMaterialNo: '',
    materialDescription: '',
    sLoc: '',
    description: '',
    totalStock: 0,
    currentStock: 0,
    minimumStock: 0,
  });

  // Sample data for demonstration
  const sampleData: InventoryItem[] = [
    {
      id: 1,
      plnt: 'A001',
      plantName: 'Main Distribution Center',
      materialCI: 'T-2055516-BFG',
      oldMaterialNo: 'BFG-205',
      materialDescription: 'BF Goodrich 205/55/R16 All-Terrain',
      sLoc: 'WH-01',
      description: 'Premium all-terrain tire',
      totalStock: 200,
      currentStock: 143,
      minimumStock: 50
    },
    {
      id: 2,
      plnt: 'A001',
      plantName: 'Main Distribution Center',
      materialCI: 'T-2557016-MIC',
      oldMaterialNo: 'MIC-255',
      materialDescription: 'Michelin 255/70/R16 Highway Terrain',
      sLoc: 'WH-02',
      description: 'Premium highway terrain tire',
      totalStock: 150,
      currentStock: 97,
      minimumStock: 30
    },
    {
      id: 3,
      plnt: 'A002',
      plantName: 'South Region Hub',
      materialCI: 'T-2157016-PIR',
      oldMaterialNo: 'PIR-215',
      materialDescription: 'Pirelli 215/70/R16 Sport',
      sLoc: 'WH-03',
      description: 'Sport performance tire',
      totalStock: 120,
      currentStock: 65,
      minimumStock: 40
    },
    {
      id: 4,
      plnt: 'A002',
      plantName: 'South Region Hub',
      materialCI: 'T-1957516-BST',
      oldMaterialNo: 'BST-195',
      materialDescription: 'Bridgestone 195/75/R16 All Season',
      sLoc: 'WH-01',
      description: 'All-season tire for passenger vehicles',
      totalStock: 250,
      currentStock: 212,
      minimumStock: 60
    },
    {
      id: 5,
      plnt: 'A003',
      plantName: 'North Distribution Hub',
      materialCI: 'T-2257517-CNT',
      oldMaterialNo: 'CNT-225',
      materialDescription: 'Continental 225/75/R17 Winter',
      sLoc: 'WH-02',
      description: 'Winter tire with advanced grip',
      totalStock: 180,
      currentStock: 86,
      minimumStock: 45
    },
  ];

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from Supabase:
        // const { data, error } = await supabase.from('inventory').select('*');
        // if (error) throw error;
        // setInventory(data || []);

        // Using sample data for demonstration
        setTimeout(() => {
          setInventory(sampleData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter((item) => {
    const searchFields = [
      item.materialCI,
      item.materialDescription,
      item.plantName,
      item.description,
    ].join(' ').toLowerCase();

    return searchFields.includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['totalStock', 'currentStock', 'minimumStock'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleAddItem = () => {
    setFormData({
      plnt: '',
      plantName: '',
      materialCI: '',
      oldMaterialNo: '',
      materialDescription: '',
      sLoc: '',
      description: '',
      totalStock: 0,
      currentStock: 0,
      minimumStock: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setCurrentItem(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      ...formData as InventoryItem,
      id: inventory.length + 1,
    };
    setInventory([...inventory, newItem]);
    setIsAddModalOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    const updatedInventory = inventory.map(item =>
      item.id === currentItem.id ? { ...item, ...formData } : item
    );
    setInventory(updatedInventory);
    setIsEditModalOpen(false);
  };

  const handleDeleteItem = (id: number) => {
    // In a real app, we would delete from Supabase:
    // await supabase.from('inventory').delete().eq('id', id);

    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-2">
          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleAddItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
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
              placeholder="Search by material, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Inventory table */}
      <div className="overflow-x-auto border-b border-gray-200 shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Plnt</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Plant Name</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Material CI</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Material Description</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">SLoc</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total Stock</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading inventory data...
                </td>
              </tr>
            ) : filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                  No inventory items found.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.plnt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.materialCI}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.materialDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sLoc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.totalStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.minimumStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${item.currentStock > item.minimumStock * 2 ? 'bg-green-100 text-green-800' :
                        item.currentStock > item.minimumStock ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {item.currentStock > item.minimumStock * 2 ? 'Good' :
                        item.currentStock > item.minimumStock ? 'Low' :
                          'Critical'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-900 bg-blue-50 rounded-md hover:bg-blue-100"
                        onClick={() => handleEditItem(item)}
                        title="Edit item"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-900 bg-red-50 rounded-md hover:bg-red-100"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inventory Item"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="plnt" className="block text-sm font-medium text-gray-700">Plant Code</label>
              <input
                type="text"
                id="plnt"
                name="plnt"
                value={formData.plnt}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="A001"
                required
              />
            </div>
            <div>
              <label htmlFor="plantName" className="block text-sm font-medium text-gray-700">Plant Name</label>
              <input
                type="text"
                id="plantName"
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Main Distribution Center"
                required
              />
            </div>
            <div>
              <label htmlFor="materialCI" className="block text-sm font-medium text-gray-700">Material CI</label>
              <input
                type="text"
                id="materialCI"
                name="materialCI"
                value={formData.materialCI}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="T-2055516-BFG"
                required
              />
            </div>
            <div>
              <label htmlFor="oldMaterialNo" className="block text-sm font-medium text-gray-700">Old Material No.</label>
              <input
                type="text"
                id="oldMaterialNo"
                name="oldMaterialNo"
                value={formData.oldMaterialNo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="BFG-205"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="materialDescription" className="block text-sm font-medium text-gray-700">Material Description</label>
              <input
                type="text"
                id="materialDescription"
                name="materialDescription"
                value={formData.materialDescription}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="BF Goodrich 205/55/R16 All-Terrain"
                required
              />
            </div>
            <div>
              <label htmlFor="sLoc" className="block text-sm font-medium text-gray-700">Storage Location</label>
              <input
                type="text"
                id="sLoc"
                name="sLoc"
                value={formData.sLoc}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="WH-01"
                required
              />
            </div>
            <div>
              <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700">Total Stock Capacity</label>
              <input
                type="number"
                id="totalStock"
                name="totalStock"
                value={formData.totalStock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">Current Stock</label>
              <input
                type="number"
                id="currentStock"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="minimumStock" className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
              <input
                type="number"
                id="minimumStock"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Item description"
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Add Item
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Inventory Item"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-plnt" className="block text-sm font-medium text-gray-700">Plant Code</label>
              <input
                type="text"
                id="edit-plnt"
                name="plnt"
                value={formData.plnt}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-plantName" className="block text-sm font-medium text-gray-700">Plant Name</label>
              <input
                type="text"
                id="edit-plantName"
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-materialCI" className="block text-sm font-medium text-gray-700">Material CI</label>
              <input
                type="text"
                id="edit-materialCI"
                name="materialCI"
                value={formData.materialCI}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-oldMaterialNo" className="block text-sm font-medium text-gray-700">Old Material No.</label>
              <input
                type="text"
                id="edit-oldMaterialNo"
                name="oldMaterialNo"
                value={formData.oldMaterialNo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="edit-materialDescription" className="block text-sm font-medium text-gray-700">Material Description</label>
              <input
                type="text"
                id="edit-materialDescription"
                name="materialDescription"
                value={formData.materialDescription}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-sLoc" className="block text-sm font-medium text-gray-700">Storage Location</label>
              <input
                type="text"
                id="edit-sLoc"
                name="sLoc"
                value={formData.sLoc}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-totalStock" className="block text-sm font-medium text-gray-700">Total Stock Capacity</label>
              <input
                type="number"
                id="edit-totalStock"
                name="totalStock"
                value={formData.totalStock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="edit-currentStock" className="block text-sm font-medium text-gray-700">Current Stock</label>
              <input
                type="number"
                id="edit-currentStock"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="edit-minimumStock" className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
              <input
                type="number"
                id="edit-minimumStock"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
