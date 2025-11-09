export interface LoanCreateInput {
  borrowerName: string;
  loanAmount: number;
  markupPercentage: number;
}

export function calculateTotalOwed(loanAmount: number, markupPercentage: number) {
  return loanAmount + loanAmount * (markupPercentage / 100);
}