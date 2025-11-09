import React from 'react';
import { SharkIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';
import { useNavigate, useLocation } from 'react-router-dom';

// FIX: Refactor from `React.FC` to a standard function component.
export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    try {
      const raw = window.localStorage.getItem('borrowerAuth');
      const auth = raw ? JSON.parse(raw) : null;
      if (auth?.id || auth?.csrfToken) {
        window.localStorage.removeItem('borrowerAuth');
      }
      // For admin mode, set a flag to disable admin API header usage
      window.localStorage.setItem('forceBorrowerMode', 'true');
      // Also clear any stored admin API key
      window.localStorage.removeItem('adminApiKey');
    } catch (_) {}
    navigate('/login');
  };

  const showLogout = location.pathname.startsWith('/admin') || location.pathname.startsWith('/borrower');

  return (
    <header className="py-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <SharkIcon className="h-8 w-8 text-primary"/>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Loanshark
            </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showLogout && (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
