import { useEffect, useState } from 'react';
import { Squircle, CircleCheck, Download, Pencil, Eye, Filter, Plus, Search, Trash2, Truck, CircleX } from 'lucide-react';
import Modal from '../components/Modal';

type TransferStatus = 'draft' | 'pending' | 'in-transit' | 'completed' | 'cancelled';

type InventoryItem = {
  id: number;
  plnt: string;
  plantName: string;
  materialCI: string;
  materialDescription: string;
  currentStock: number;
};

type Warehouse = {
  id: string;
  name: string;
};

type TransferItem = {
  id: string;
  itemId: number;
  materialCI: string;
  materialDescription: string;
  quantity: number;
};

type StockTransfer = {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  requestDate: string;
  scheduledDate: string;
  completionDate?: string;
  status: TransferStatus;
  notes: string;
  items: TransferItem[];
  createdBy: string;
  statusHistory: {
    status: TransferStatus;
    date: string;
    note?: string;
  }[];
};

const StockTransfer = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransferStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState<StockTransfer | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [formData, setFormData] = useState<Partial<StockTransfer>>({
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    items: [],
  });
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Status options mapping
  const statusOptions: Record<TransferStatus, { label: string, color: string, icon: React.ElementType }> = {
    'draft': { 
      label: 'Draft', 
      color: 'bg-gray-100 text-gray-800', 
      icon: Pencil 
    },
    'pending': { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Squircle 
    },
    'in-transit': { 
      label: 'In Transit', 
      color: 'bg-blue-100 text-blue-800', 
      icon: Truck 
    },
    'completed': { 
      label: 'Completed', 
      color: 'bg-green-100 text-green-800', 
      icon: CircleCheck 
    },
    'cancelled': { 
      label: 'Cancelled', 
      color: 'bg-red-100 text-red-800', 
      icon: CircleX 
    },
  };

  // Sample warehouse data
  const sampleWarehouses: Warehouse[] = [
    { id: 'WH001', name: 'Main Distribution Center' },
    { id: 'WH002', name: 'North Region Hub' },
    { id: 'WH003', name: 'South Region Hub' },
    { id: 'WH004', name: 'Eastern Warehouse' },
    { id: 'WH005', name: 'Western Distribution Center' },
  ];

  // Sample inventory data - would typically come from the inventory module
  const sampleInventory: InventoryItem[] = [
    {
      id: 1,
      plnt: 'A001',
      plantName: 'Main Distribution Center',
      materialCI: 'T-2055516-BFG',
      materialDescription: 'BF Goodrich 205/55/R16 All-Terrain',
      currentStock: 143
    },
    {
      id: 2,
      plnt: 'A001',
      plantName: 'Main Distribution Center',
      materialCI: 'T-2557016-MIC',
      materialDescription: 'Michelin 255/70/R16 Highway Terrain',
      currentStock: 97
    },
    {
      id: 3,
      plnt: 'A002',
      plantName: 'South Region Hub',
      materialCI: 'T-2157016-PIR',
      materialDescription: 'Pirelli 215/70/R16 Sport',
      currentStock: 65
    },
    {
      id: 4,
      plnt: 'A002',
      plantName: 'South Region Hub',
      materialCI: 'T-1957516-BST',
      materialDescription: 'Bridgestone 195/75/R16 All Season',
      currentStock: 212
    },
    {
      id: 5,
      plnt: 'A003',
      plantName: 'North Region Hub',
      materialCI: 'T-2257517-CNT',
      materialDescription: 'Continental 225/75/R17 Winter',
      currentStock: 86
    },
  ];

  // Load data from localStorage on mount
  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        
        // Load transfer data
        const savedTransfers = localStorage.getItem('stockTransfers');
        if (savedTransfers) {
          setTransfers(JSON.parse(savedTransfers));
        }
        
        // Set sample warehouses
        setWarehouses(sampleWarehouses);
        
        // Set sample inventory
        setInventory(sampleInventory);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save transfers to localStorage whenever they change
  useEffect(() => {
    if (transfers.length > 0) {
      localStorage.setItem('stockTransfers', JSON.stringify(transfers));
    }
  }, [transfers]);

  // Update available items when source warehouse changes
  useEffect(() => {
    if (formData.sourceWarehouseId) {
      // Find warehouse plnt code based on selected warehouse ID
      const sourceWarehouse = warehouses.find(w => w.id === formData.sourceWarehouseId);
      if (sourceWarehouse) {
        // Filter inventory items that belong to this warehouse
        // In a real app, you would match the warehouse ID to the inventory's plnt
        // For demo purposes, we're just showing some items
        setAvailableItems(inventory.filter(item => item.currentStock > 0));
      } else {
        setAvailableItems([]);
      }
    } else {
      setAvailableItems([]);
    }
  }, [formData.sourceWarehouseId, warehouses, inventory]);

  // Filter transfers based on search term and status
  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch = [
      transfer.transferNumber,
      transfer.sourceWarehouseName,
      transfer.destinationWarehouseName,
    ].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Generate a transfer number
  const generateTransferNumber = () => {
    const prefix = 'TRF';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    return `${prefix}-${date}-${randomNum}`;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset the destination warehouse if it's the same as source
    if (name === 'sourceWarehouseId' && value === formData.destinationWarehouseId) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        destinationWarehouseId: '',
      }));
      return;
    }
    
    // Reset the source warehouse if it's the same as destination
    if (name === 'destinationWarehouseId' && value === formData.sourceWarehouseId) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        sourceWarehouseId: '',
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding an item to the transfer
  const handleAddItem = () => {
    if (!selectedItem) {
      setErrorMessage('Please select an item to transfer');
      return;
    }
    
    if (itemQuantity <= 0) {
      setErrorMessage('Quantity must be greater than zero');
      return;
    }
    
    if (itemQuantity > selectedItem.currentStock) {
      setErrorMessage(`Quantity cannot exceed available stock (${selectedItem.currentStock})`);
      return;
    }
    
    // Check if item already exists in the list
    const existingItemIndex = formData.items?.findIndex(item => item.itemId === selectedItem.id);
    
    if (existingItemIndex !== undefined && existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...(formData.items || [])];
      const existingQuantity = updatedItems[existingItemIndex].quantity;
      
      // Check if new total quantity exceeds available stock
      if (existingQuantity + itemQuantity > selectedItem.currentStock) {
        setErrorMessage(`Total quantity cannot exceed available stock (${selectedItem.currentStock})`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: existingQuantity + itemQuantity
      };
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      // Add new item
      const newItem: TransferItem = {
        id: crypto.randomUUID(),
        itemId: selectedItem.id,
        materialCI: selectedItem.materialCI,
        materialDescription: selectedItem.materialDescription,
        quantity: itemQuantity
      };
      
      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem]
      }));
    }
    
    // Reset selection
    setSelectedItem(null);
    setItemQuantity(1);
    setErrorMessage('');
  };

  // Handle removing an item from the transfer
  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
  };

  // Create a new transfer
  const handleCreateTransfer = () => {
    setFormData({
      sourceWarehouseId: '',
      destinationWarehouseId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: '',
      items: [],
    });
    setSelectedItem(null);
    setItemQuantity(1);
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  // Submit the transfer form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sourceWarehouseId || !formData.destinationWarehouseId) {
      setErrorMessage('Please select both source and destination warehouses');
      return;
    }
    
    if (!formData.items || formData.items.length === 0) {
      setErrorMessage('Please add at least one item to transfer');
      return;
    }
    
    const sourceWarehouse = warehouses.find(w => w.id === formData.sourceWarehouseId);
    const destinationWarehouse = warehouses.find(w => w.id === formData.destinationWarehouseId);
    
    if (!sourceWarehouse || !destinationWarehouse) {
      setErrorMessage('Invalid warehouse selection');
      return;
    }
    
    const now = new Date().toISOString();
    const newTransfer: StockTransfer = {
      id: crypto.randomUUID(),
      transferNumber: generateTransferNumber(),
      sourceWarehouseId: formData.sourceWarehouseId,
      sourceWarehouseName: sourceWarehouse.name,
      destinationWarehouseId: formData.destinationWarehouseId,
      destinationWarehouseName: destinationWarehouse.name,
      requestDate: now,
      scheduledDate: formData.scheduledDate || now.split('T')[0],
      status: formData.status as TransferStatus || 'draft',
      notes: formData.notes || '',
      items: formData.items || [],
      createdBy: 'Admin User',
      statusHistory: [
        {
          status: formData.status as TransferStatus || 'draft',
          date: now,
          note: 'Transfer created'
        }
      ],
    };
    
    setTransfers([...transfers, newTransfer]);
    setIsAddModalOpen(false);
  };

  // View transfer details
  const handleViewTransfer = (transfer: StockTransfer) => {
    setCurrentTransfer(transfer);
    setIsViewModalOpen(true);
  };

  // Delete a transfer
  const handleDeleteTransfer = (id: string) => {
    // Only allow deletion of draft transfers
    const transfer = transfers.find(t => t.id === id);
    if (transfer && transfer.status !== 'draft') {
      alert('Only draft transfers can be deleted');
      return;
    }
    
    setTransfers(transfers.filter(transfer => transfer.id !== id));
  };

  // Open status change modal
  const handleStatusChangeClick = () => {
    if (!currentTransfer) return;
    setStatusNote('');
    setIsStatusModalOpen(true);
  };

  // Handle status change
  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransfer) return;
    
    const form = e.target as HTMLFormElement;
    const newStatus = form.status.value as TransferStatus;
    
    const now = new Date().toISOString();
    
    let completionDate = currentTransfer.completionDate;
    if (newStatus === 'completed' && !completionDate) {
      completionDate = now;
    }
    
    const updatedTransfer: StockTransfer = {
      ...currentTransfer,
      status: newStatus,
      completionDate,
      statusHistory: [
        ...(currentTransfer.statusHistory || []),
        {
          status: newStatus,
          date: now,
          note: statusNote.trim() || undefined
        }
      ]
    };
    
    setTransfers(transfers.map(transfer => transfer.id === currentTransfer.id ? updatedTransfer : transfer));
    setCurrentTransfer(updatedTransfer);
    setIsStatusModalOpen(false);
  };

  // Get status badge
  const getStatusBadge = (status: TransferStatus) => {
    const { label, color, icon: Icon } = statusOptions[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  // Get total items count in a transfer
  const getTotalItems = (transfer: StockTransfer) => {
    return transfer.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if status change is allowed based on current status
  const getAllowedNextStatuses = (currentStatus: TransferStatus): TransferStatus[] => {
    switch (currentStatus) {
      case 'draft': return ['pending', 'cancelled'];
      case 'pending': return ['in-transit', 'cancelled'];
      case 'in-transit': return ['completed', 'cancelled'];
      case 'completed': return [];
      case 'cancelled': return [];
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Transfer</h1>
        <div className="flex space-x-2">
          <button 
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleCreateTransfer}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
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
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TransferStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusOptions).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Object.entries(statusOptions).map(([status, { label, color, icon: Icon }]) => {
          const count = transfers.filter(transfer => transfer.status === status).length;
          return (
            <div key={status} className="p-3 bg-white rounded-lg shadow">
              <div className={`${color.split(' ')[0]} w-full px-3 py-2 rounded-md text-center mb-2 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 mr-1 ${color.split(' ')[1]}`} />
                <span className={`font-medium ${color.split(' ')[1]}`}>{label}</span>
              </div>
              <div className="text-2xl font-bold text-center">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Transfers table */}
      <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Transfer #</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Destination</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Request Date</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading transfer data...
                </td>
              </tr>
            ) : filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No transfers found. Create your first stock transfer.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer" onClick={() => handleViewTransfer(transfer)}>
                    {transfer.transferNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.sourceWarehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.destinationWarehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTotalItems(transfer)} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transfer.requestDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transfer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-900 bg-blue-50 rounded-md hover:bg-blue-100"
                        onClick={() => handleViewTransfer(transfer)}
                        title="View transfer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {transfer.status === 'draft' && (
                        <button 
                          className="p-1 text-red-600 hover:text-red-900 bg-red-50 rounded-md hover:bg-red-100"
                          onClick={() => handleDeleteTransfer(transfer.id)}
                          title="Delete transfer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Transfer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Stock Transfer"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Error message */}
            {errorMessage && (
              <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
                {errorMessage}
              </div>
            )}
          
            {/* Warehouse Selection */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Warehouse Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sourceWarehouseId" className="block text-sm font-medium text-gray-700">Source Warehouse</label>
                  <select
                    id="sourceWarehouseId"
                    name="sourceWarehouseId"
                    value={formData.sourceWarehouseId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Source Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option 
                        key={warehouse.id} 
                        value={warehouse.id}
                        disabled={warehouse.id === formData.destinationWarehouseId}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="destinationWarehouseId" className="block text-sm font-medium text-gray-700">Destination Warehouse</label>
                  <select
                    id="destinationWarehouseId"
                    name="destinationWarehouseId"
                    value={formData.destinationWarehouseId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Destination Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option 
                        key={warehouse.id} 
                        value={warehouse.id}
                        disabled={warehouse.id === formData.sourceWarehouseId}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">Scheduled Date</label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Initial Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Add any notes about this transfer"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Item Selection */}
            {formData.sourceWarehouseId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-3">Add Items</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="item" className="block text-sm font-medium text-gray-700">Select Item</label>
                    <select
                      id="item"
                      value={selectedItem?.id || ''}
                      onChange={(e) => {
                        const itemId = parseInt(e.target.value);
                        const item = availableItems.find(i => i.id === itemId) || null;
                        setSelectedItem(item);
                        if (item) {
                          setItemQuantity(1); // Reset quantity
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select an item</option>
                      {availableItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.materialCI} - {item.materialDescription} (Available: {item.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <div className="flex items-center mt-1">
                      <input
                        type="number"
                        id="quantity"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        min="1"
                        max={selectedItem?.currentStock || 1}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedItem}
                        className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {formData.items && formData.items.length > 0 ? (
                  <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Code</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{item.materialCI}</td>
                            <td className="px-3 py-2 whitespace-normal text-sm">{item.materialDescription}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-500 border rounded-md">
                    No items added to transfer yet
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Create Transfer
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

      {/* View Transfer Details Modal */}
      {currentTransfer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Stock Transfer: ${currentTransfer.transferNumber}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">Stock Transfer</div>
                <h3 className="text-lg font-bold">{currentTransfer.transferNumber}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  Requested: {new Date(currentTransfer.requestDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(currentTransfer.status)}
                {getAllowedNextStatuses(currentTransfer.status).length > 0 && (
                  <button
                    onClick={handleStatusChangeClick}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Source Warehouse</h4>
                <div className="text-sm">
                  <p className="font-semibold">{currentTransfer.sourceWarehouseName}</p>
                  <p className="text-gray-600 text-xs">ID: {currentTransfer.sourceWarehouseId}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Destination Warehouse</h4>
                <div className="text-sm">
                  <p className="font-semibold">{currentTransfer.destinationWarehouseName}</p>
                  <p className="text-gray-600 text-xs">ID: {currentTransfer.destinationWarehouseId}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Request Date</h4>
                <div className="text-sm font-semibold">
                  {new Date(currentTransfer.requestDate).toLocaleDateString()}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Scheduled Date</h4>
                <div className="text-sm font-semibold">
                  {new Date(currentTransfer.scheduledDate).toLocaleDateString()}
                </div>
              </div>
              {currentTransfer.completionDate && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Completion Date</h4>
                  <div className="text-sm font-semibold">
                    {new Date(currentTransfer.completionDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {currentTransfer.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                <div className="text-sm text-gray-700">
                  {currentTransfer.notes}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Transfer Items</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Code</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTransfer.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{item.materialCI}</td>
                        <td className="px-4 py-3 whitespace-normal text-sm">{item.materialDescription}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.quantity}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium">Total Items:</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">{getTotalItems(currentTransfer)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status History */}
            {currentTransfer.statusHistory && currentTransfer.statusHistory.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Status History</h4>
                <div className="border rounded-lg divide-y">
                  {currentTransfer.statusHistory.map((record, index) => (
                    <div key={index} className="p-3 flex justify-between items-start">
                      <div className="flex items-center">
                        {getStatusBadge(record.status)}
                        {record.note && <p className="text-sm text-gray-500 ml-2">{record.note}</p>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {currentTransfer && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Update Transfer Status"
          size="md"
        >
          <form onSubmit={handleStatusChange}>
            <div className="space-y-4">
              <div>
                <label htmlFor="statusUpdate" className="block text-sm font-medium text-gray-700">
                  Current Status: {statusOptions[currentTransfer.status].label}
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue={currentTransfer.status}
                >
                  <option value={currentTransfer.status}>{statusOptions[currentTransfer.status].label} (Current)</option>
                  {getAllowedNextStatuses(currentTransfer.status).map(status => (
                    <option key={status} value={status}>{statusOptions[status].label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="statusNote" className="block text-sm font-medium text-gray-700">
                  Status Note (Optional)
                </label>
                <textarea
                  id="statusNote"
                  name="statusNote"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add a note about this status change"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Update Status
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StockTransfer;
