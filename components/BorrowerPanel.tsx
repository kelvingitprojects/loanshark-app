import React, { useMemo, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const REGISTER_BORROWER = gql`
  mutation RegisterBorrower($firstName: String!, $surname: String!, $phoneNumber: String!, $whatsappNumber: String) {
    registerBorrower(firstName: $firstName, surname: $surname, phoneNumber: $phoneNumber, whatsappNumber: $whatsappNumber) {
      id
      firstName
      surname
      phoneNumber
      whatsappNumber
      csrfToken
      createdAt
    }
  }
`;

const REQUEST_LOAN = gql`
  mutation RequestLoan($amount: Float!) {
    requestLoan(amount: $amount) {
      id
      amount
      status
      createdAt
      borrower { firstName surname }
    }
  }
`;

const MY_LOAN_REQUESTS = gql`
  query MyLoanRequests {
    myLoanRequests {
      id
      amount
      status
      createdAt
    }
  }
`;

const MY_LOANS = gql`
  query MyLoans {
    myLoans {
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

export function BorrowerPanel({ hideRegistration = false }: { hideRegistration?: boolean }) {
  const [auth, setAuth] = useLocalStorage<{ id?: string; csrfToken?: string }>('borrowerAuth', {});
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [amount, setAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'DECLINED'>('all');

  const { data: myRequestsData, loading: requestsLoading, error: requestsError, refetch } = useQuery(MY_LOAN_REQUESTS, {
    skip: !auth.id || !auth.csrfToken,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: 8000
  });

  const { data: myLoansData, loading: loansLoading, error: loansError, refetch: refetchLoans } = useQuery(MY_LOANS, {
    skip: !auth.id || !auth.csrfToken,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: 8000
  });

  const [registerBorrower, { loading: regLoading }] = useMutation(REGISTER_BORROWER, {
    onCompleted: ({ registerBorrower }) => {
      setAuth({ id: registerBorrower.id, csrfToken: registerBorrower.csrfToken });
      toast.success('Registered successfully');
    }
  });

  const [requestLoan, { loading: reqLoading }] = useMutation(REQUEST_LOAN, {
    onCompleted: () => {
      setAmount('');
      refetch();
      toast.success('Loan request submitted');
    },
    onError: (err) => {
      toast.error(`Request failed: ${err.message}`);
    }
  });

  const requests = myRequestsData?.myLoanRequests ?? [];
  const filtered = useMemo(() => {
    return filter === 'all' ? requests : requests.filter((r: any) => r.status === filter);
  }, [requests, filter]);

  const totals = useMemo(() => {
    return requests.reduce(
      (acc: any, r: any) => {
        acc.count[r.status] = (acc.count[r.status] || 0) + 1;
        acc.amount[r.status] = (acc.amount[r.status] || 0) + r.amount;
        return acc;
      },
      { count: { PENDING: 0, APPROVED: 0, DECLINED: 0 }, amount: { PENDING: 0, APPROVED: 0, DECLINED: 0 } }
    );
  }, [requests]);

  const loans = myLoansData?.myLoans ?? [];
  const balances = useMemo(() => {
    const totalOwed = loans.reduce((sum: number, l: any) => sum + (l.totalOwed || 0), 0);
    const totalRepaid = loans.reduce((sum: number, l: any) => sum + (l.totalRepaid || 0), 0);
    const remaining = Math.max(0, totalOwed - totalRepaid);
    return { totalOwed, totalRepaid, remaining };
  }, [loans]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Client</CardTitle>
          {auth.id && auth.csrfToken && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { refetch(); refetchLoans(); }}>Refresh</Button>
              <Button variant="ghost" onClick={() => {
                setAuth({});
                try { window.localStorage.removeItem('borrowerAuth'); } catch (_) {}
                navigate('/login');
              }}>Logout</Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hideRegistration && (!auth.id || !auth.csrfToken) ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} />
            </div>
            <Input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input placeholder="WhatsApp number (optional)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            <Button disabled={regLoading || !firstName || !surname || !phone} onClick={() => registerBorrower({ variables: { firstName, surname, phoneNumber: phone, whatsappNumber: whatsapp || null } })}>
              {regLoading ? 'Registering…' : 'Register as Borrower'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Registered as borrower. You can request a loan.</div>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button disabled={reqLoading || !amount || Number(amount) <= 0} onClick={() => requestLoan({ variables: { amount: Number(amount) } })}>
                {reqLoading ? 'Requesting…' : 'Request Loan'}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded border border-input">
                <div className="text-muted-foreground">Pending</div>
                <div className="font-medium">{totals.count.PENDING} • {formatCurrency(totals.amount.PENDING)}</div>
              </div>
              <div className="p-2 rounded border border-input">
                <div className="text-muted-foreground">Approved</div>
                <div className="font-medium">{totals.count.APPROVED} • {formatCurrency(totals.amount.APPROVED)}</div>
              </div>
              <div className="p-2 rounded border border-input">
                <div className="text-muted-foreground">Declined</div>
                <div className="font-medium">{totals.count.DECLINED} • {formatCurrency(totals.amount.DECLINED)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Filter</label>
              <select className="h-9 px-3 rounded-md border border-input bg-transparent text-sm" value={filter} onChange={e => setFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="font-medium">My Requests</div>
              {requestsLoading ? (
                <div className="text-sm text-muted-foreground">Loading requests…</div>
              ) : requestsError ? (
                <div className="text-sm text-red-600">Failed to load requests: {String(requestsError.message || requestsError)}</div>
              ) : (
                <ul className="space-y-1">
                  {filtered?.length ? (
                    filtered.map((r: any) => (
                      <li key={r.id} className="text-sm flex justify-between">
                        <span>{new Date(r.createdAt).toLocaleString()} — {formatCurrency(r.amount)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${r.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' : r.status === 'DECLINED' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{r.status}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">No requests yet.</li>
                  )}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <div className="font-medium">Payments & Balance</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded border border-input">
                  <div className="text-muted-foreground">Total Owed</div>
                  <div className="font-medium">{formatCurrency(balances.totalOwed)}</div>
                </div>
                <div className="p-2 rounded border border-input">
                  <div className="text-muted-foreground">Total Repaid</div>
                  <div className="font-medium">{formatCurrency(balances.totalRepaid)}</div>
                </div>
                <div className="p-2 rounded border border-input">
                  <div className="text-muted-foreground">Remaining</div>
                  <div className={`font-medium ${balances.remaining <= 0 ? 'text-green-600' : 'text-primary'}`}>{formatCurrency(balances.remaining)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Your loans and payment history</div>
                {loansLoading ? (
                  <div className="text-sm text-muted-foreground">Loading payments & balances…</div>
                ) : loansError ? (
                  <div className="text-sm text-red-600">Failed to load payments: {String(loansError.message || loansError)}</div>
                ) : (
                  <ul className="space-y-2">
                    {loans?.length ? loans.map((l: any) => (
                      <li key={l.id} className="rounded border border-input p-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{l.borrowerName}</div>
                          <div className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">Principal</div>
                            <div className="font-medium">{formatCurrency(l.loanAmount)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total Owed</div>
                            <div className="font-medium">{formatCurrency(l.totalOwed)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Repaid</div>
                            <div className="font-medium">{formatCurrency(l.totalRepaid)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Remaining</div>
                            <div className={`font-medium ${Math.max(0, (l.totalOwed || 0) - (l.totalRepaid || 0)) <= 0 ? 'text-green-600' : 'text-primary'}`}>{formatCurrency(Math.max(0, (l.totalOwed || 0) - (l.totalRepaid || 0)))}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground">Payments</div>
                          <ul className="text-xs space-y-1 mt-1">
                            {l.repayments?.length ? l.repayments.map((p: any) => (
                              <li key={p.id} className="flex justify-between">
                                <span>{new Date(p.date).toLocaleDateString()}</span>
                                <span className="font-medium">{formatCurrency(p.amount)}</span>
                              </li>
                            )) : <li className="text-muted-foreground">No payments yet.</li>}
                          </ul>
                        </div>
                      </li>
                    )) : <li className="text-sm text-muted-foreground">No loans yet.</li>}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}