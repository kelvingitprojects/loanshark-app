
import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

interface LoanFormProps {
  onAddLoan: (borrowerName: string, loanAmount: number, markupPercentage: number) => void;
}

// FIX: Refactor from `React.FC` to a standard function component.
export const LoanForm = ({ onAddLoan }: LoanFormProps) => {
  const [borrowerName, setBorrowerName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState('50');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);
    const markup = parseFloat(markupPercentage);

    if (!borrowerName.trim() || isNaN(amount) || amount <= 0 || isNaN(markup) || markup < 0) {
      setError('Please fill in all fields with valid values.');
      return;
    }

    onAddLoan(borrowerName, amount, markup);
    setBorrowerName('');
    setLoanAmount('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="borrowerName" className="block text-sm font-medium mb-1">Borrower's Name</label>
          <Input
            id="borrowerName"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            placeholder="e.g., John Doe"
            required
          />
        </div>
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium mb-1">Loan Amount (R)</label>
          <Input
            id="loanAmount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g., 1000"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="markupPercentage" className="block text-sm font-medium mb-1">Markup (%)</label>
          <Input
            id="markupPercentage"
            type="number"
            value={markupPercentage}
            onChange={(e) => setMarkupPercentage(e.target.value)}
            required
            min="0"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full md:w-auto">Add Loan</Button>
    </form>
  );
};
