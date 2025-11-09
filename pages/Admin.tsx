import React from 'react';
import { Header } from '../components/Header';
import { AdminPanel } from '../components/AdminPanel';
import { AdminSidebar } from '../components/AdminSidebar';
import AdminOverview from '../components/AdminOverview';
import AdminBorrowers from '../components/AdminBorrowers';
import AdminPayments from '../components/AdminPayments';
import { useLocation } from 'react-router-dom';

export default function Admin() {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-[260px_1fr] gap-6">
          <aside>
            <AdminSidebar />
          </aside>
          <section>
            {currentTab === 'overview' ? (
              <AdminOverview />
            ) : currentTab === 'loans' ? (
              <AdminOverview />
            ) : currentTab === 'borrowers' ? (
              <AdminBorrowers />
            ) : currentTab === 'payments' ? (
              <AdminPayments />
            ) : (
              <AdminPanel />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}