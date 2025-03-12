import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ChartBar, FileText, LayoutDashboard, LogOut, Menu, PackageSearch, RefreshCw, TrendingUp, Truck, Warehouse, X } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: PackageSearch },
    { name: 'Inventory Forecast', href: '/inventory-forecast', icon: TrendingUp },
    { name: 'Stock Transfer', href: '/stock-transfer', icon: RefreshCw },
    { name: 'Delivery Tracking', href: '/delivery', icon: Truck },
    { name: 'Sales Order', href: '/sales-order', icon: FileText },
    { name: 'Cost Analysis', href: '/cost-analysis', icon: ChartBar },
    { name: 'Warehouse', href: '/warehouse', icon: Warehouse },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Chitra Inventory</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
          <div className="p-4 border-t">
            <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="w-6 h-6 text-gray-500" />
            </button>
            <div className="flex items-center">
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Welcome back!</div>
                <div className="text-sm font-medium text-gray-900">Admin User</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
