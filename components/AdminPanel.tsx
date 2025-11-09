import React from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';

const PENDING_LOAN_REQUESTS = gql`
  query PendingLoanRequests {
    pendingLoanRequests {
      id
      amount
      status
      createdAt
      borrower { firstName surname }
    }
  }
`;

const APPROVE_LOAN_REQUEST = gql`
  mutation ApproveLoanRequest($id: ID!, $note: String) {
    approveLoanRequest(id: $id, note: $note) {
      id
      status
      adminNote
      decidedAt
    }
  }
`;

const DECLINE_LOAN_REQUEST = gql`
  mutation DeclineLoanRequest($id: ID!, $note: String) {
    declineLoanRequest(id: $id, note: $note) {
      id
      status
      adminNote
      decidedAt
    }
  }
`;

export function AdminPanel() {
  const { data, loading, refetch } = useQuery(PENDING_LOAN_REQUESTS);
  const [approve, { loading: approveLoading }] = useMutation(APPROVE_LOAN_REQUEST, {
    onCompleted: () => refetch(),
    refetchQueries: ['PendingLoanRequests', 'GetLoans'],
    awaitRefetchQueries: true
  });
  const [decline, { loading: declineLoading }] = useMutation(DECLINE_LOAN_REQUEST, {
    onCompleted: () => refetch(),
    refetchQueries: ['PendingLoanRequests', 'GetLoans'],
    awaitRefetchQueries: true
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading pending requests…</div>
        ) : (
          <ul className="space-y-2">
            {data?.pendingLoanRequests?.length ? (
              data.pendingLoanRequests.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between gap-4">
                  <div className="text-sm">
                    <div className="font-medium">{r.borrower.firstName} {r.borrower.surname}</div>
                    <div className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()} — {formatCurrency(r.amount)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" disabled={approveLoading} onClick={() => approve({ variables: { id: r.id, note: 'Approved via UI' } })}>Approve</Button>
                    <Button variant="destructive" disabled={declineLoading} onClick={() => decline({ variables: { id: r.id, note: 'Declined via UI' } })}>Decline</Button>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No pending requests.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}