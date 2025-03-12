import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InventoryForecast from './pages/InventoryForecast';
import Delivery from './pages/Delivery';
import CostAnalysis from './pages/CostAnalysis';
import Warehouse from './pages/Warehouse';
import SalesOrder from './pages/SalesOrder';
import StockTransfer from './pages/StockTransfer';
import ErrorPage from './pages/ErrorPage';
import './index.css';

export function App() {
  useEffect(() => {
    // Include required font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory-forecast" element={<InventoryForecast />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="cost-analysis" element={<CostAnalysis />} />
        <Route path="warehouse" element={<Warehouse />} />
        <Route path="sales-order" element={<SalesOrder />} />
        <Route path="stock-transfer" element={<StockTransfer />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
