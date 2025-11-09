import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import toast from 'react-hot-toast';

const LIST_BORROWERS = gql`
  query ListBorrowers {
    borrowers {
      id
      firstName
      surname
      phoneNumber
      whatsappNumber
      createdAt
      status
      csrfToken
    }
  }
`;

export function AdminBorrowers() {
  const { data, loading, error } = useQuery(LIST_BORROWERS, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    pollInterval: 10000
  });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (e) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrowers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading borrowers…</div>
        ) : error ? (
          <div className="text-sm text-red-600">Failed to load borrowers: {String(error.message || error)}</div>
        ) : (
          <ul className="space-y-2">
            {data?.borrowers?.length ? (
              data.borrowers.map((b: any) => (
                <li key={b.id} className="rounded border border-input p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{b.firstName} {b.surname}</div>
                    <div className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-medium">{b.phoneNumber}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">WhatsApp</div>
                      <div className="font-medium">{b.whatsappNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <span className={`px-2 py-0.5 rounded text-xs ${b.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' : b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-gray-500/10 text-gray-600'}`}>{b.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Borrower ID</div>
                      <div className="flex items-center gap-2">
                        <code className="text-muted-foreground break-all">{b.id}</code>
                        <button className="text-primary underline" onClick={() => copy(b.id)}>Copy</button>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">CSRF Token</div>
                      <div className="flex items-center gap-2">
                        <code className="text-muted-foreground break-all">{b.csrfToken}</code>
                        <button className="text-primary underline" onClick={() => copy(b.csrfToken)}>Copy</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No borrowers registered yet.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminBorrowers;