import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomersCRMManager } from './components/CustomersCRMManager';
import { ProductManager } from './components/ProductManager';
import { CRMLeadsManager } from './components/CRMLeadsManager';
import { OrdersManager } from './components/OrdersManager';
import { AppointmentsManager } from './components/AppointmentsManager';
import { getCRMStats } from './services/adminApi';
import type { CRMStats } from './types/admin';

const AdminPortalContent: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<CRMStats | null>(null);

  const loadStats = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getCRMStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading CRM stats:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} onRefresh={loadStats}>
      {activeTab === 'dashboard' && (
        <AdminDashboard stats={stats} onNavigateTab={setActiveTab} onRefresh={loadStats} />
      )}
      {activeTab === 'customers' && <CustomersCRMManager />}
      {activeTab === 'products' && <ProductManager />}
      {activeTab === 'inquiries' && <CRMLeadsManager />}
      {activeTab === 'orders' && <OrdersManager />}
      {activeTab === 'appointments' && <AppointmentsManager />}
    </AdminLayout>
  );
};

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminPortalContent />
    </AdminAuthProvider>
  );
}
