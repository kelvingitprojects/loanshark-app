import { PrismaClient } from "@prisma/client";
import { calculateTotalOwed, LoanCreateInput } from "../models/loan";

export class LoanService {
  constructor(private prisma: PrismaClient) {}

  async listLoans() {
    return this.prisma.loan.findMany({
      orderBy: { createdAt: "desc" },
      include: { repayments: true }
    });
  }

  async loansForBorrowerName(borrowerName: string) {
    return this.prisma.loan.findMany({
      where: { borrowerName },
      orderBy: { createdAt: "desc" },
      include: { repayments: true }
    });
  }

  async addLoan(input: LoanCreateInput) {
    const totalOwed = calculateTotalOwed(input.loanAmount, input.markupPercentage);
    return this.prisma.loan.create({
      data: {
        borrowerName: input.borrowerName,
        loanAmount: input.loanAmount,
        markupPercentage: input.markupPercentage,
        totalOwed
      },
      include: { repayments: true }
    });
  }

  async addRepayment(loanId: string, amount: number) {
    await this.prisma.repayment.create({
      data: { amount, loanId }
    });
    return this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { repayments: true }
    });
  }

  async deleteLoan(id: string) {
    await this.prisma.loan.delete({ where: { id } });
    return { id };
  }

  async updateLoan(id: string, input: { borrowerName?: string; loanAmount?: number; markupPercentage?: number }) {
    const existing = await this.prisma.loan.findUnique({ where: { id } });
    if (!existing) throw new Error("Loan not found");

    const newLoanAmount = input.loanAmount ?? existing.loanAmount;
    const newMarkup = input.markupPercentage ?? existing.markupPercentage;
    const newTotalOwed = calculateTotalOwed(newLoanAmount, newMarkup);

    return this.prisma.loan.update({
      where: { id },
      data: {
        borrowerName: input.borrowerName ?? existing.borrowerName,
        loanAmount: newLoanAmount,
        markupPercentage: newMarkup,
        totalOwed: newTotalOwed
      },
      include: { repayments: true }
    });
  }

  async totalRepaidForLoans(ids: string[]) {
    const grouped = await this.prisma.repayment.groupBy({
      by: ["loanId"],
      where: { loanId: { in: ids } },
      _sum: { amount: true }
    });
    const map = new Map(grouped.map(g => [g.loanId, g._sum.amount ?? 0]));
    return ids.map(id => map.get(id) ?? 0);
  }

  async listRepayments() {
    return this.prisma.repayment.findMany({
      orderBy: { date: "desc" }
    });
  }

  async getLoansByIds(ids: string[]) {
    const loans = await this.prisma.loan.findMany({ where: { id: { in: ids } } });
    const map = new Map(loans.map(l => [l.id, l]));
    return ids.map(id => map.get(id) || null);
  }
}