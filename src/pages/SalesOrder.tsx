import { useEffect, useState } from 'react';
import { Calendar, Download, FileText, Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { InventoryItem } from '../lib/types';

type LineItem = {
  id: string;
  productDescription: string;
  quantity: number;
  price: number;
  total: number;
  fromLookup: boolean; // Flag to indicate if price is from lookup
};

type OrderStatus = 'pending-delivery' | 'pending-invoice' | 'pending-item' | 'delivery' | 'done';

type SalesOrder = {
  id: string;
  poNumber: string;
  poDate: string;
  customerName: string;
  customerAddress: string;
  items: LineItem[];
  totalAmount: number;
  createdAt: string;
  status: OrderStatus;
  statusHistory?: {
    status: OrderStatus;
    date: string;
    note?: string;
  }[];
};

const SalesOrder = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<SalesOrder | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [currentLineItemId, setCurrentLineItemId] = useState<string | null>(null);
  const [inventoryLookup, setInventoryLookup] = useState<InventoryItem[]>([]);
  const [lookupSearchTerm, setLookupSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<SalesOrder>>({
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    items: [
      { id: crypto.randomUUID(), productDescription: '', quantity: 1, price: 0, total: 0, fromLookup: false }
    ],
    status: 'pending-delivery'
  });

  // Status options mapping
  const statusOptions: Record<OrderStatus, { label: string, color: string }> = {
    'pending-delivery': { label: 'Pending Delivery', color: 'bg-yellow-100 text-yellow-800' },
    'pending-invoice': { label: 'Pending Invoice', color: 'bg-blue-100 text-blue-800' },
    'pending-item': { label: 'Pending Item', color: 'bg-purple-100 text-purple-800' },
    'delivery': { label: 'Delivery', color: 'bg-indigo-100 text-indigo-800' },
    'done': { label: 'Done', color: 'bg-green-100 text-green-800' },
  };

    // Sample inventory data (for demonstration)
  const sampleInventoryData: InventoryItem[] = [
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

  // Load orders from localStorage on mount
  useEffect(() => {
    const fetchOrders = () => {
      try {
        setLoading(true);
        const savedOrders = localStorage.getItem('salesOrders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
        // Load sample inventory data (replace with actual fetch in real app)
    setInventoryLookup(sampleInventoryData);
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('salesOrders', JSON.stringify(orders));
    }
  }, [orders]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = [
      order.poNumber,
      order.customerName,
    ].join(' ').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate line item total
  const calculateLineItemTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  // Calculate order total
  const calculateOrderTotal = (items: LineItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenLookup = (itemId: string) => {
    setCurrentLineItemId(itemId);
    setIsLookupModalOpen(true);
  };

 const handleSelectInventoryItem = (item: InventoryItem) => {
    if (!currentLineItemId) return;

    setFormData(prev => {
      const updatedItems = prev.items?.map(lineItem => {
        if (lineItem.id === currentLineItemId) {
          return {
            ...lineItem,
            productDescription: item.materialDescription,
            price: 100000, // Replace with actual price (fetch from your inventory data)
            total: calculateLineItemTotal(lineItem.quantity, 100000),
            fromLookup: true,
          };
        }
        return lineItem;
      }) || [];

      const totalAmount = calculateOrderTotal(updatedItems);

      return { ...prev, items: updatedItems, totalAmount };
    });

    setIsLookupModalOpen(false);
    setCurrentLineItemId(null); // Reset currentLineItemId
  };

  // Handle line item changes
const handleLineItemChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
  const { name, value } = e.target;

  setFormData(prev => {
    const updatedItems = prev.items?.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [name]: value };

        if (name === 'quantity' || name === 'price') {
          const quantity = parseFloat(name === 'quantity' ? value : updatedItem.quantity.toString());
          const price = parseFloat(name === 'price' ? value : updatedItem.price.toString());

          if (!isNaN(quantity) && !isNaN(price)) {
            updatedItem.total = quantity * price;
          }
        }
        return updatedItem;
      }
      return item;
    }) || [];

    const totalAmount = calculateOrderTotal(updatedItems);

    return { ...prev, items: updatedItems, totalAmount };
  });
};

  // Add new line item
  const handleAddLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { id: crypto.randomUUID(), productDescription: '', quantity: 1, price: 0, total: 0, fromLookup: false }
      ]
    }));
  };

  // Remove line item
  const handleRemoveLineItem = (itemId: string) => {
    setFormData(prev => {
      const updatedItems = prev.items?.filter(item => item.id !== itemId) || [];
      const totalAmount = calculateOrderTotal(updatedItems); // Recalculate after removing
        return {
            ...prev,
            items: updatedItems,
            totalAmount,
        }
    });
  };

  // Open the "Create Order" modal
  const handleCreateOrder = () => {
    setFormData({
      poNumber: '',
      poDate: new Date().toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      items: [
        { id: crypto.randomUUID(), productDescription: '', quantity: 1, price: 0, total: 0, fromLookup: false }
      ],
      status: 'pending-delivery'
    });
    setIsAddModalOpen(true);
  };

  // Submit the form to create a new order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const items = formData.items || [];
    const totalAmount = calculateOrderTotal(items);

    const newOrder: SalesOrder = {
      id: crypto.randomUUID(),
      poNumber: formData.poNumber || '',
      poDate: formData.poDate || new Date().toISOString().split('T')[0],
      customerName: formData.customerName || '',
      customerAddress: formData.customerAddress || '',
      items: items,
      totalAmount: totalAmount,
      createdAt: new Date().toISOString(),
      status: formData.status as OrderStatus || 'pending-delivery',
      statusHistory: [
        {
          status: formData.status as OrderStatus || 'pending-delivery',
          date: new Date().toISOString(),
          note: 'Order created'
        }
      ]
    };

    setOrders([...orders, newOrder]);
    setIsAddModalOpen(false);
  };

  // View order details
  const handleViewOrder = (order: SalesOrder) => {
    setCurrentOrder(order);
    setIsDetailModalOpen(true);
  };

  // Delete an order
  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  // Open status change modal
  const handleStatusChangeClick = () => {
    if (!currentOrder) return;
    setStatusNote('');
    setIsStatusModalOpen(true);
  };

  // Handle status change
  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const form = e.target as HTMLFormElement;
    const newStatus = form.status.value as OrderStatus;

    const updatedOrder: SalesOrder = {
      ...currentOrder,
      status: newStatus,
      statusHistory: [
        ...(currentOrder.statusHistory || []),
        {
          status: newStatus,
          date: new Date().toISOString(),
          note: statusNote.trim() || undefined
        }
      ]
    };

    setOrders(orders.map(order => order.id === currentOrder.id ? updatedOrder : order));
    setCurrentOrder(updatedOrder);
    setIsStatusModalOpen(false);
  };

// Get status badge color
const getStatusBadge = (status: OrderStatus) => {
  console.log("getStatusBadge called with status:", status); // Debugging log
  const statusInfo = statusOptions[status];

  if (!statusInfo) {
    console.warn(`Invalid status: ${status}`); // Warning for invalid status
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800`}>
        Unknown Status
      </span>
    );
  }

  const { label, color } = statusInfo;
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {label}
    </span>
  );
};

    const filteredInventoryLookup = inventoryLookup.filter(item =>
    item.materialDescription.toLowerCase().includes(lookupSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
        <div className="flex space-x-2">
          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={handleCreateOrder}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
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
              placeholder="Search by PO number, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
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
        {Object.entries(statusOptions).map(([status, { label, color }]) => {
          const count = orders.filter(order => order.status === status).length;
          return (
            <div key={status} className="p-3 bg-white rounded-lg shadow">
              <div className={`${color.split(' ')[0]} w-full px-3 py-2 rounded-md text-center mb-2`}>
                <span className={`font-medium ${color.split(' ')[1]}`}>{label}</span>
              </div>
              <div className="text-2xl font-bold text-center">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Sales Order table */}
      <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading sales order data...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No sales orders found. Create your first order.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer" onClick={() => handleViewOrder(order)}>
                    {order.poNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.poDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-900 bg-blue-50 rounded-md hover:bg-blue-100"
                        onClick={() => handleViewOrder(order)}
                        title="View order"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-900 bg-red-50 rounded-md hover:bg-red-100"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Delete order"
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

      {/* Create Order Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Sales Order"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Header Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Purchase Order Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700">PO Number</label>
                  <input
                    type="text"
                    id="poNumber"
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="poDate" className="block text-sm font-medium text-gray-700">PO Date</label>
                  <input
                    type="date"
                    id="poDate"
                    name="poDate"
                    value={formData.poDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                    {Object.entries(statusOptions).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Customer Address</label>
                  <textarea
                    id="customerAddress"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-medium text-gray-900">Order Items</h3>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Description</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items?.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => handleOpenLookup(item.id)}
                                className="inline-flex items-center p-1 border border-gray-300 rounded-md shadow-sm text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                          <input
                            type="text"
                            name="productDescription"
                            value={item.productDescription}
                            onChange={(e) => handleLineItemChange(e, item.id)}
                            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter product description"
                            required
                          />
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            min="1"
                            onChange={(e) => handleLineItemChange(e, item.id)}
                            className="block w-24 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500                            focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            name="price"
                            value={item.price}
                            min="0"
                            onChange={(e) => handleLineItemChange(e, item.id)}
                            className={`block w-32 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${item.fromLookup ? 'bg-gray-100 text-gray-500' : ''}`}
                            required
                            disabled={item.fromLookup}
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium">Total Amount:</td>
                      <td className="px-3 py-2 text-sm font-bold">
                        {formatCurrency(calculateOrderTotal(formData.items || []))}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Create Order
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

      {/* View Order Details Modal */}
      {currentOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Sales Order: ${currentOrder.poNumber}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">Sales Order</div>
                <h3 className="text-lg font-bold">{currentOrder.poNumber}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {currentOrder.poDate}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(currentOrder.status)}
                <button
                  onClick={handleStatusChangeClick}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="text-sm">
                  <p className="font-semibold">{currentOrder.customerName}</p>
                  <p className="whitespace-pre-line text-gray-600">{currentOrder.customerAddress}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-600">Order Date:</p>
                    <p className="font-semibold">{currentOrder.poDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount:</p>
                    <p className="font-semibold">{formatCurrency(currentOrder.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items:</p>
                    <p className="font-semibold">{currentOrder.items.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Status:</p>
                    <p className="font-semibold">{statusOptions[currentOrder.status].label}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-normal text-sm">{item.productDescription}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Total:</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">{formatCurrency(currentOrder.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status History */}
            {currentOrder.statusHistory && currentOrder.statusHistory.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Status History</h4>
                <div className="border rounded-lg divide-y">
                  {currentOrder.statusHistory.map((record, index) => (
                    <div key={index} className="p-3 flex justify-between items-start">
                      <div>
                        <span className="font-medium">{statusOptions[record.status].label}</span>
                        {record.note && <p className="text-sm text-gray-500 mt-1">{record.note}</p>}
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
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {currentOrder && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Update Order Status"
          size="md"
        >
          <form onSubmit={handleStatusChange}>
            <div className="space-y-4">
              <div>
                <label htmlFor="statusUpdate" className="block text-sm font-medium text-gray-700">
                  Current Status: {currentOrder ? statusOptions[currentOrder.status].label : 'Unknown'}
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue={currentOrder ? currentOrder.status : 'pending-delivery'}
                >
                  {Object.entries(statusOptions).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
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

        {/* Inventory Lookup Modal */}
      <Modal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        title="Select Product from Inventory"
        size="lg"
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search inventory..."
            value={lookupSearchTerm}
            onChange={(e) => setLookupSearchTerm(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material CI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventoryLookup.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.materialCI}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.materialDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => handleSelectInventoryItem(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default SalesOrder;
