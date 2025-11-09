import React from "react";

export function EmailTemplate({ borrower, amount }: { borrower: string; amount: number }) {
  return (
    <html>
      <body>
        <h1>Loan Created</h1>
        <p>
          Hi {borrower}, a new loan of R{amount.toFixed(2)} was created.
        </p>
      </body>
    </html>
  );
}