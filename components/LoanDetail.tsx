import React, { useState, FormEvent } from 'react';
import { Loan } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { ArrowLeftIcon, TrashIcon, SparklesIcon } from './icons';
import { ProgressBar } from './ProgressBar';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'framer-motion';

interface LoanDetailProps {
  loan: Loan;
  onBack: () => void;
  onAddRepayment: (loanId: string, amount: number) => void;
  onDeleteLoan: (loanId: string) => void;
  onUpdateLoan?: (id: string, updates: { borrowerName?: string; loanAmount?: number; markupPercentage?: number }) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

const formatDate = (value: string | number | Date) => {
    let d: Date | null = null;
    try {
      if (value instanceof Date) {
        d = value;
      } else if (typeof value === 'number') {
        d = new Date(value);
      } else if (typeof value === 'string') {
        // Try ISO parse first
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
          d = new Date(parsed);
        } else {
          // Fallback: numeric epoch string
          const asNum = Number(value);
          if (!Number.isNaN(asNum)) d = new Date(asNum);
        }
      }
    } catch {}

    if (!d || Number.isNaN(d.getTime())) return 'Unknown date';
    return d.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
};

// FIX: Refactor from `React.FC` to a standard function component to resolve framer-motion prop type errors.
const LoanDetail = ({ loan, onBack, onAddRepayment, onDeleteLoan, onUpdateLoan }: LoanDetailProps) => {
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [error, setError] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBorrowerName, setEditBorrowerName] = useState(loan.borrowerName);
  const [editLoanAmount, setEditLoanAmount] = useState(String(loan.loanAmount));
  const [editMarkup, setEditMarkup] = useState(String(loan.markupPercentage));

  const totalRepaidLocal = (loan.repayments ?? []).reduce((sum, r) => sum + r.amount, 0);
  const remaining = loan.totalOwed - totalRepaidLocal;
  const progress = (totalRepaidLocal / loan.totalOwed) * 100;
  const isPaidOff = remaining <= 0;

  const handleUpdateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(editLoanAmount);
    const markup = parseFloat(editMarkup);
    if (!editBorrowerName.trim() || isNaN(amount) || amount <= 0 || isNaN(markup) || markup < 0) {
      setError('Please enter valid loan details.');
      return;
    }
    onUpdateLoan?.(loan.id, { borrowerName: editBorrowerName, loanAmount: amount, markupPercentage: markup });
    setIsEditing(false);
    setError('');
  };

  const handleRepaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(repaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (amount > remaining && !isPaidOff) {
      setError(`Repayment cannot exceed the remaining balance of ${formatCurrency(remaining)}.`);
      return;
    }
    onAddRepayment(loan.id, amount);
    setRepaymentAmount('');
    setError('');
  };

  const getAiAdvice = async (promptType: 'advice' | 'plan') => {
    setIsLoadingAi(true);
    setAiInsight('');
    try {
      const apiKey = process.env.API_KEY as string | undefined;
      if (!apiKey) {
        setAiInsight('Set GEMINI_API_KEY in .env.local to enable insights.');
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const loanDetailsText = `
        Borrower: ${loan.borrowerName}
        Original Loan Amount: ${formatCurrency(loan.loanAmount)}
        Markup: ${loan.markupPercentage}%
        Total Owed: ${formatCurrency(loan.totalOwed)}
        Total Repaid: ${formatCurrency(loan.totalRepaid)}
        Remaining Balance: ${formatCurrency(remaining)}
        Loan Date: ${formatDate(loan.createdAt)}
        Repayment History: ${loan.repayments.length > 0 ? loan.repayments.map(r => `${formatCurrency(r.amount)} on ${formatDate(r.date)}`).join(', ') : 'No repayments yet.'}
      `;

      let prompt = '';
      if (promptType === 'advice') {
        prompt = `Based on the following loan details, provide some brief, actionable financial advice for the borrower. Be encouraging and focus on positive steps they can take. Keep it concise (2-3 short paragraphs) and format it cleanly. \n\n${loanDetailsText}`;
      } else {
        prompt = `Based on the following loan details, create a simple, suggested weekly or bi-weekly repayment plan to help the borrower pay off the remaining balance in a reasonable timeframe. Present it as a list. \n\n${loanDetailsText}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAiInsight(response.text);

    } catch (err) {
      console.error('AI advice error:', err);
      setAiInsight('Sorry, I was unable to get advice at this time. Please try again later.');
    } finally {
      setIsLoadingAi(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to all loans
        </Button>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Loan
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => onDeleteLoan(loan.id)}>
              <TrashIcon className="h-4 w-4 mr-2"/>
              Delete Loan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{loan.borrowerName}</CardTitle>
            <p className="text-muted-foreground">Loan taken on {formatDate(loan.createdAt)}</p>
            </div>
            {isPaidOff && (
                <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900/50 dark:text-green-300">
                    Paid Off
                </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Principal</p>
                <p className="text-2xl font-bold">{formatCurrency(loan.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markup</p>
                <p className="text-2xl font-bold">{loan.markupPercentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Owed</p>
                <p className="text-2xl font-bold">{formatCurrency(loan.totalOwed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${isPaidOff ? 'text-green-500' : 'text-primary'}`}>{formatCurrency(Math.max(0, remaining))}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Borrower</label>
                <Input value={editBorrowerName} onChange={e => setEditBorrowerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Principal (R)</label>
                <Input type="number" value={editLoanAmount} onChange={e => setEditLoanAmount(e.target.value)} min="0.01" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Markup (%)</label>
                <Input type="number" value={editMarkup} onChange={e => setEditMarkup(e.target.value)} min="0" />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          )}
          <div>
            <ProgressBar value={progress} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Repayment History</CardTitle>
          </CardHeader>
          <CardContent>
            {!isPaidOff && (
              <form onSubmit={handleRepaymentSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={repaymentAmount}
                  onChange={(e) => {
                    setRepaymentAmount(e.target.value);
                    setError('');
                  }}
                  min="0.01"
                  step="0.01"
                  className="flex-grow"
                  aria-label="Repayment amount"
                />
                <Button type="submit">Add</Button>
              </form>
            )}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            {loan.repayments.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {loan.repayments.slice().reverse().map((repayment) => (
                        <li key={repayment.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <span className="font-medium">{formatCurrency(repayment.amount)}</span>
                            <span className="text-sm text-muted-foreground">{formatDate(repayment.date)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-center py-4">No repayments made yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-yellow-400"/>
                    Gemini Financial Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!isPaidOff && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <Button className="flex-1" variant="outline" onClick={() => getAiAdvice('advice')} disabled={isLoadingAi || !process.env.API_KEY}>Get Advice</Button>
                        <Button className="flex-1" variant="outline" onClick={() => getAiAdvice('plan')} disabled={isLoadingAi || !process.env.API_KEY}>Suggest Plan</Button>
                    </div>
                )}
                {isLoadingAi && <p className="text-muted-foreground text-center animate-pulse">Thinking...</p>}
                {aiInsight && (
                  // FIX: framer-motion props are now correctly typed.
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap"
                  >
                    {aiInsight}
                  </motion.div>
                )}
                 { !isPaidOff && !aiInsight && !isLoadingAi && (
                    <p className="text-center text-muted-foreground text-sm pt-4">Get personalized tips or a repayment plan to tackle this loan.</p>
                 )}
                 { isPaidOff && (
                    <p className="text-center text-green-500 font-medium pt-4">This loan is fully paid off. Great job!</p>
                 )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanDetail;