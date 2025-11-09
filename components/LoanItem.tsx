import React, { useState } from 'react';
import { Loan } from '../types';
import { ProgressBar } from './ProgressBar';
import { ChevronRightIcon, CheckIcon, SpinnerIcon } from './icons';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface LoanItemProps {
  loan: Loan;
  onSelect: (loanId: string) => void;
  onMarkAsPaid: (loanId: string) => void;
}

// FIX: Refactor from `React.FC` to a standard function component to resolve framer-motion prop type errors.
export const LoanItem = ({ loan, onSelect, onMarkAsPaid }: LoanItemProps) => {
  const [isPayingOff, setIsPayingOff] = useState(false);
  const totalRepaidLocal = (loan.repayments ?? []).reduce((sum, r) => sum + r.amount, 0);
  const remaining = loan.totalOwed - totalRepaidLocal;
  const progress = (totalRepaidLocal / loan.totalOwed) * 100;
  const isPaidOff = remaining <= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const handleMarkAsPaidClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPayingOff(true);
    try {
      await onMarkAsPaid(loan.id);
    } catch (error) {
      // Error toast is handled by the mutation hook in App.tsx
      console.error("Failed to mark loan as paid", error);
    } finally {
      setIsPayingOff(false);
    }
  };

  return (
    // FIX: framer-motion props are now correctly typed.
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      onClick={() => onSelect(loan.id)}
      className={`p-4 border rounded-lg transition-all duration-300 cursor-pointer group ${isPaidOff ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10' : 'border-border hover:border-primary/50'}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg text-card-foreground group-hover:text-primary">{loan.borrowerName}</h4>
              <p className="text-sm text-muted-foreground">
                Loaned: {formatCurrency(loan.loanAmount)} @ {loan.markupPercentage}%
              </p>
            </div>
            {isPaidOff && (
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900/50 dark:text-green-300">
                    Paid Off
                </span>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{formatCurrency(totalRepaidLocal)} Repaid</span>
              <span className="font-semibold text-card-foreground">{formatCurrency(loan.totalOwed)} Total</span>
            </div>
            <ProgressBar value={progress} />
            <div className="text-right text-sm font-medium">
              {isPaidOff ? (
                <span className="text-green-500">Fully Repaid!</span>
              ) : (
                <span className="text-foreground">
                  {formatCurrency(remaining)} Remaining
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center gap-2">
            {!isPaidOff && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
                    onClick={handleMarkAsPaidClick}
                    aria-label="Mark as fully paid"
                    title="Mark as fully paid"
                    disabled={isPayingOff}
                >
                    {isPayingOff ? (
                        <SpinnerIcon className="h-5 w-5" />
                    ) : (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                    )}
                </Button>
            )}
            <ChevronRightIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
};