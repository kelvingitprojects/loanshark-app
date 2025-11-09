import React from 'react';
import { Header } from '../components/Header';
import { BorrowerPanel } from '../components/BorrowerPanel';

export default function BorrowerDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
        <BorrowerPanel hideRegistration />
      </main>
    </div>
  );
}