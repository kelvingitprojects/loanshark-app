import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

const LIST_PAYMENTS = gql`
  query ListPayments {
    repayments {
      id
      borrowerName
      amount
      date
    }
  }
`;

export function AdminPayments() {
  const { data, loading, error } = useQuery(LIST_PAYMENTS, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: 10000
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading payments…</div>
        ) : error ? (
          <div className="text-sm text-red-600">Failed to load payments: {String(error.message || error)}</div>
        ) : (
          <ul className="space-y-2">
            {data?.repayments?.length ? (
              data.repayments.map((r: any) => (
                <li key={r.id} className="rounded border border-input p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{r.borrowerName}</span>
                      <span>•</span>
                      <span>R{Number(r.amount).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleString()}</div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No payments recorded yet.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminPayments;