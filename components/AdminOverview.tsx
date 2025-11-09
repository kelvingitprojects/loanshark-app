import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Loan } from '../types';
import { SharkIcon, CoinsIcon, NoLoansIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from './DashboardSkeleton';
import { LoanListSkeleton } from './LoanListSkeleton';
import { LoanForm } from './LoanForm';
import { LoanItem } from './LoanItem';

const Dashboard = lazy(() => import('./Dashboard'));
const LoanDetail = lazy(() => import('./LoanDetail'));
const ConfirmationModal = lazy(() => import('./ConfirmationModal'));

const GET_LOANS = gql`
  query GetLoans {
    loans {
      id
      borrowerName
      loanAmount
      markupPercentage
      totalOwed
      totalRepaid
      createdAt
      repayments { id amount date }
    }
  }
`;

const ADD_LOAN = gql`
  mutation AddLoan($borrowerName: String!, $loanAmount: Float!, $markupPercentage: Float!) {
    addLoan(borrowerName: $borrowerName, loanAmount: $loanAmount, markupPercentage: $markupPercentage) {
      id
      borrowerName
      loanAmount
      markupPercentage
      totalOwed
      totalRepaid
      createdAt
      repayments { id amount date }
    }
  }
`;

const ADD_REPAYMENT = gql`
  mutation AddRepayment($loanId: ID!, $amount: Float!) {
    addRepayment(loanId: $loanId, amount: $amount) {
      id
      borrowerName
      loanAmount
      markupPercentage
      totalOwed
      totalRepaid
      createdAt
      repayments { id amount date }
    }
  }
`;

const DELETE_LOAN = gql`
  mutation DeleteLoan($id: ID!) { deleteLoan(id: $id) { id } }
`;

const UPDATE_LOAN = gql`
  mutation UpdateLoan($id: ID!, $borrowerName: String, $loanAmount: Float, $markupPercentage: Float) {
    updateLoan(id: $id, borrowerName: $borrowerName, loanAmount: $loanAmount, markupPercentage: $markupPercentage) {
      id
      borrowerName
      loanAmount
      markupPercentage
      totalOwed
      totalRepaid
      createdAt
      repayments { id amount date }
    }
  }
`;

type SortKey = 'createdAt' | 'borrowerName' | 'totalOwed' | 'remaining';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'paidOff';

interface GetLoansData { loans: Loan[] }
interface AddLoanData { addLoan: Loan }
interface AddLoanVars { borrowerName: string; loanAmount: number; markupPercentage: number }
interface AddRepaymentData { addRepayment: Loan }
interface AddRepaymentVars { loanId: string; amount: number }
interface DeleteLoanData { deleteLoan: { id: string } }
interface DeleteLoanVars { id: string }
interface UpdateLoanData { updateLoan: Loan }
interface UpdateLoanVars { id: string; borrowerName?: string; loanAmount?: number; markupPercentage?: number }

export default function AdminOverview() {
  const { loading, error, data } = useQuery<GetLoansData>(GET_LOANS);
  const loans: Loan[] = data?.loans || [];

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);

  const [addLoanMutation] = useMutation<AddLoanData, AddLoanVars>(ADD_LOAN, {
    refetchQueries: [{ query: GET_LOANS }],
    onError: (err) => toast.error(`Failed to add loan: ${err.message}`),
  });
  const [addRepaymentMutation] = useMutation<AddRepaymentData, AddRepaymentVars>(ADD_REPAYMENT, {
    onError: (err) => toast.error(`Failed to add repayment: ${err.message}`),
    update: (cache, { data }) => {
      const updatedLoan = data?.addRepayment;
      if (!updatedLoan) return;
      const existing = cache.readQuery<GetLoansData>({ query: GET_LOANS });
      if (!existing) return;
      cache.writeQuery<GetLoansData>({ query: GET_LOANS, data: { loans: existing.loans.map(l => l.id === updatedLoan.id ? updatedLoan : l) } });
    },
  });
  const [deleteLoanMutation] = useMutation<DeleteLoanData, DeleteLoanVars>(DELETE_LOAN, {
    refetchQueries: [{ query: GET_LOANS }],
    onError: (err) => toast.error(`Failed to delete loan: ${err.message}`),
  });
  const [updateLoanMutation] = useMutation<UpdateLoanData, UpdateLoanVars>(UPDATE_LOAN, {
    onError: (err) => toast.error(`Failed to update loan: ${err.message}`),
    update: (cache, { data }) => {
      const updatedLoan = data?.updateLoan; if (!updatedLoan) return;
      const existing = cache.readQuery<GetLoansData>({ query: GET_LOANS }); if (!existing) return;
      cache.writeQuery<GetLoansData>({ query: GET_LOANS, data: { loans: existing.loans.map(l => l.id === updatedLoan.id ? updatedLoan : l) } });
    },
  });

  const addLoan = useCallback(async (borrowerName: string, loanAmount: number, markupPercentage: number) => {
    try { await addLoanMutation({ variables: { borrowerName, loanAmount, markupPercentage } }); toast.success(`${borrowerName}'s loan has been added!`); } catch(e) { console.error(e); }
  }, [addLoanMutation]);

  const addRepayment = useCallback(async (loanId: string, amount: number) => {
    const loanBeforeRepayment = loans.find(l => l.id === loanId); if (!loanBeforeRepayment) return;
    try {
      const { data: mutationData } = await addRepaymentMutation({ 
        variables: { loanId, amount },
        optimisticResponse: {
          addRepayment: {
            __typename: 'Loan', id: loanBeforeRepayment.id, borrowerName: loanBeforeRepayment.borrowerName,
            loanAmount: loanBeforeRepayment.loanAmount, markupPercentage: loanBeforeRepayment.markupPercentage,
            totalOwed: loanBeforeRepayment.totalOwed, totalRepaid: loanBeforeRepayment.totalRepaid + amount,
            createdAt: loanBeforeRepayment.createdAt,
            repayments: [...loanBeforeRepayment.repayments, { __typename: 'Repayment', id: `temp-${Date.now()}`, amount, date: new Date().toISOString() }],
          },
        },
      });
      const updatedLoan = mutationData?.addRepayment ?? { ...loanBeforeRepayment, totalRepaid: loanBeforeRepayment.totalRepaid + amount };
      const remaining = updatedLoan.totalOwed - updatedLoan.totalRepaid;
      if (remaining <= 0 && (loanBeforeRepayment.totalOwed - loanBeforeRepayment.totalRepaid) > 0) {
        toast.success(`${updatedLoan.borrowerName}'s loan has been fully paid off! 🎉`);
      } else {
        const formatted = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
        toast.success(`Repayment of ${formatted} recorded for ${updatedLoan.borrowerName}.`);
      }
    } catch (e) { console.error(e); }
  }, [addRepaymentMutation, loans]);

  const markLoanAsPaid = useCallback((loanId: string) => {
    const loan = loans.find(l => l.id === loanId); if (!loan) { toast.error("Loan not found."); return; }
    const remaining = loan.totalOwed - loan.totalRepaid;
    if (remaining > 0) { addRepayment(loanId, remaining); } else { toast("This loan is already paid off."); }
  }, [loans, addRepayment]);

  const updateLoan = useCallback(async (id: string, updates: { borrowerName?: string; loanAmount?: number; markupPercentage?: number }) => {
    const existing = loans.find(l => l.id === id); if (!existing) return;
    const nextLoanAmount = updates.loanAmount ?? existing.loanAmount; const nextMarkup = updates.markupPercentage ?? existing.markupPercentage;
    const nextTotalOwed = nextLoanAmount + nextLoanAmount * (nextMarkup / 100);
    try {
      await updateLoanMutation({
        variables: { id, ...updates },
        optimisticResponse: { updateLoan: { __typename: 'Loan', id, borrowerName: updates.borrowerName ?? existing.borrowerName, loanAmount: nextLoanAmount, markupPercentage: nextMarkup, totalOwed: nextTotalOwed, totalRepaid: existing.totalRepaid, createdAt: existing.createdAt, repayments: existing.repayments.map(r => ({ __typename: 'Repayment', ...r })) } }
      });
      toast.success(`Loan updated for ${updates.borrowerName ?? existing.borrowerName}.`);
    } catch (e) { console.error(e); }
  }, [updateLoanMutation, loans]);

  const requestDeleteLoan = (loanId: string) => { setLoanToDelete(loanId); setDeleteModalOpen(true); };
  const confirmDeleteLoan = useCallback(async () => {
    if (loanToDelete) {
      const loan = loans.find(l => l.id === loanToDelete);
      try { await deleteLoanMutation({ variables: { id: loanToDelete } }); toast.error(`${loan?.borrowerName}'s loan has been deleted.`); if (selectedLoanId === loanToDelete) setSelectedLoanId(null); }
      catch (e) { console.error(e); }
      finally { setLoanToDelete(null); setDeleteModalOpen(false); }
    }
  }, [loanToDelete, loans, deleteLoanMutation, selectedLoanId]);

  const sortedAndFilteredLoans = useMemo(() => {
    return [...loans]
      .filter(loan => {
        if (filterStatus === 'all') return true;
        const isPaidOff = (loan.totalOwed - loan.totalRepaid) <= 0;
        if (filterStatus === 'active') return !isPaidOff;
        if (filterStatus === 'paidOff') return isPaidOff;
        return true;
      })
      .sort((a, b) => {
        let valA: string | number; let valB: string | number;
        if (sortKey === 'remaining') { valA = a.totalOwed - a.totalRepaid; valB = b.totalOwed - b.totalRepaid; }
        else if (sortKey === 'createdAt') { valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); }
        else { valA = a[sortKey]; valB = b[sortKey]; }
        if (typeof valA === 'string' && typeof valB === 'string') { return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA); }
        else { return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number); }
      });
  }, [loans, sortKey, sortDirection, filterStatus]);

  const selectedLoan = useMemo(() => loans.find(l => l.id === selectedLoanId), [loans, selectedLoanId]);
  const isUnauthorized = error && typeof error.message === 'string' && error.message.toLowerCase().includes('unauthorized');

  if (error) return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-2">Failed to Load Data</h2>
      {isUnauthorized ? (
        <p className="text-muted-foreground">Unauthorized. Admin API key missing or disabled.</p>
      ) : (
        <p className="text-muted-foreground">Could not connect to the GraphQL server.</p>
      )}
      <pre className="mt-2 p-3 bg-muted rounded-md text-sm text-destructive-foreground whitespace-pre-wrap">{String(error.message)}</pre>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {selectedLoan ? (
        <motion.div key="loan-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <Suspense fallback={<div className="p-8">Loading…</div>}>
            {/* Detail view */}
            <LoanDetail 
              loan={selectedLoan} 
              onBack={() => setSelectedLoanId(null)}
              onAddRepayment={addRepayment}
              onDeleteLoan={requestDeleteLoan}
              onUpdateLoan={updateLoan}
            />
          </Suspense>
        </motion.div>
      ) : (
        <motion.div key="loan-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="grid gap-8">
          {/* Admin overview widgets */}
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard loans={loans} />
            </Suspense>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CoinsIcon className="h-6 w-6" />
                Log a New Loan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoanForm onAddLoan={addLoan} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <SharkIcon className="h-6 w-6" />
                  Loans
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} className="h-9 px-3 rounded-md border border-input bg-transparent text-sm w-full">
                    <option value="active">Active</option>
                    <option value="paidOff">Paid Off</option>
                    <option value="all">All</option>
                  </select>
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="h-9 px-3 rounded-md border border-input bg-transparent text-sm w-full">
                    <option value="createdAt">Date</option>
                    <option value="borrowerName">Name</option>
                    <option value="totalOwed">Amount</option>
                    <option value="remaining">Remaining</option>
                  </select>
                  <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value as SortDirection)} className="h-9 px-3 rounded-md border border-input bg-transparent text-sm w-full">
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoanListSkeleton />
              ) : sortedAndFilteredLoans.length > 0 ? (
                <div className="space-y-4">
                  {sortedAndFilteredLoans.map(loan => (
                    <LoanItem 
                      key={loan.id} 
                      loan={loan} 
                      onSelect={() => setSelectedLoanId(loan.id)}
                      onMarkAsPaid={markLoanAsPaid}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center">
                  <NoLoansIcon className="w-24 h-24 mb-4 text-muted-foreground/50"/>
                  <p className="text-muted-foreground font-medium">No loans to display.</p>
                  <p className="text-sm text-muted-foreground">Add one above or adjust your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Suspense fallback={null}>
            <ConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              onConfirm={confirmDeleteLoan}
              title="Delete Loan"
              description="Are you sure you want to delete this loan? This action cannot be undone."
            />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}