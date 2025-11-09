export interface Loan {
  id: string;
  borrowerName: string;
  loanAmount: number;
  markupPercentage: number;
  totalOwed: number;
  repayments: Repayment[];
  totalRepaid: number;
  createdAt: string;
}

export interface Repayment {
  id: string;
  amount: number;
  date: string;
}
