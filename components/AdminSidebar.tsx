import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { CoinsIcon, TrashIcon, CheckIcon, SparklesIcon, ChevronRightIcon } from './icons';
import { useNavigate, useLocation } from 'react-router-dom';

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    navigate(url.pathname + url.search);
  };

  const items = [
    { key: 'overview', label: 'Overview', icon: SparklesIcon },
    { key: 'pending', label: 'Pending Requests', icon: CheckIcon },
    { key: 'borrowers', label: 'Borrowers', icon: CoinsIcon },
    { key: 'loans', label: 'Loans', icon: CoinsIcon },
    { key: 'payments', label: 'Payments', icon: CoinsIcon },
    { key: 'collections', label: 'Collections', icon: TrashIcon },
    { key: 'reports', label: 'Reports', icon: SparklesIcon },
    { key: 'settings', label: 'Settings', icon: SparklesIcon },
  ];

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-xl">Admin Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={currentTab === key ? 'secondary' : 'ghost'}
            className="w-full justify-between"
            onClick={() => go(key)}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            <ChevronRightIcon className="h-4 w-4 opacity-60" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default AdminSidebar;