import type { IResolvers } from "mercurius";
import DataLoader from "dataloader";
import { LoanService } from "../services/loanService";
import { BorrowerService } from "../services/borrowerService";
import { AddLoanSchema, AddRepaymentSchema, DeleteLoanSchema, UpdateLoanSchema, RegisterBorrowerSchema, RequestLoanSchema, ApproveDeclineSchema, AdminLoginSchema } from "./validators";
import { env } from "../config/env";

export const buildResolvers = (loanService: LoanService, borrowerService: BorrowerService): IResolvers => {
  const totalRepaidLoader = new DataLoader<string, number>(async (keys) => {
    return loanService.totalRepaidForLoans(keys as string[]);
  });

  const loanByIdLoader = new DataLoader<string, any>(async (keys) => {
    return loanService.getLoansByIds(keys as string[]);
  });

  return {
    Borrower: {
      status: async (borrower: any) => {
        return borrowerService.statusForBorrower(borrower.id);
      },
      // Ensure createdAt is a consistent ISO string
      createdAt: (borrower: any) => {
        try {
          return new Date(borrower.createdAt).toISOString();
        } catch {
          return String(borrower.createdAt);
        }
      }
    },
    Loan: {
      totalRepaid: async (loan: any) => {
        return totalRepaidLoader.load(loan.id);
      },
      // Ensure consistent ISO string serialization for date fields
      createdAt: (loan: any) => {
        try {
          return new Date(loan.createdAt).toISOString();
        } catch {
          return String(loan.createdAt);
        }
      }
    },
    Repayment: {
      // Ensure repayment date is an ISO string
      date: (repayment: any) => {
        try {
          return new Date(repayment.date).toISOString();
        } catch {
          return String(repayment.date);
        }
      },
      borrowerName: async (repayment: any) => {
        try {
          const loan = await loanByIdLoader.load(repayment.loanId);
          return loan?.borrowerName ?? "Unknown";
        } catch {
          return "Unknown";
        }
      }
    },
    LoanRequest: {
      createdAt: (lr: any) => {
        try { return new Date(lr.createdAt).toISOString(); } catch { return String(lr.createdAt); }
      },
      updatedAt: (lr: any) => {
        try { return new Date(lr.updatedAt).toISOString(); } catch { return String(lr.updatedAt); }
      },
      decidedAt: (lr: any) => {
        if (!lr.decidedAt) return null;
        try { return new Date(lr.decidedAt).toISOString(); } catch { return String(lr.decidedAt); }
      }
    },
    Query: {
      loans: async (_root, _args, { user }) => {
        if (!user) throw new Error("Unauthorized");
        const loans = await loanService.listLoans();
        // Active loans only: outstanding > 0
        const ids = loans.map(l => l.id);
        const repaidTotals = await loanService.totalRepaidForLoans(ids);
        return loans.filter((loan, idx) => {
          const totalRepaid = repaidTotals[idx] ?? 0;
          return (loan.totalOwed - totalRepaid) > 0.000001;
        });
      },
      repayments: async (_root, _args, { user }) => {
        if (!user || user.role !== "admin") throw new Error("Unauthorized");
        return loanService.listRepayments();
      },
      borrowers: async (_root, _args, { user }) => {
        if (!user || user.role !== "admin") throw new Error("Unauthorized");
        return borrowerService.listBorrowers();
      },
      pendingLoanRequests: async (_root, _args, { user }) => {
        if (!user || user.role !== "admin") throw new Error("Unauthorized");
        return borrowerService.pendingLoanRequests();
      },
      myLoanRequests: async (_root, _args, { user }) => {
        if (!user || user.role !== "user") throw new Error("Unauthorized");
        return borrowerService.myLoanRequests(user.id);
      }
      ,
      myLoans: async (_root, _args, { user }) => {
        if (!user || user.role !== "user") throw new Error("Unauthorized");
        const borrower = await borrowerService.getBorrowerById(user.id);
        if (!borrower) return [];
        const borrowerName = `${borrower.firstName} ${borrower.surname}`.trim();
        return loanService.loansForBorrowerName(borrowerName);
      }
    },
    Mutation: {
      adminLogin: async (_root, args: any) => {
        const { email, password } = AdminLoginSchema.parse(args);
        if (!env.API_KEY) throw new Error("Unauthorized");
        if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) throw new Error("Unauthorized");
        return { apiKey: env.API_KEY } as any;
      },
      addLoan: async (_root, args: any, { user }) => {
        if (!user) throw new Error("Unauthorized");
        const validated = AddLoanSchema.parse(args);
        return loanService.addLoan(validated);
      },
      addRepayment: async (_root, args: any, { user }) => {
        if (!user) throw new Error("Unauthorized");
        const validated = AddRepaymentSchema.parse(args);
        return loanService.addRepayment(validated.loanId, validated.amount);
      },
      deleteLoan: async (_root, args: any, { user }) => {
        if (!user) throw new Error("Unauthorized");
        const validated = DeleteLoanSchema.parse(args);
        return loanService.deleteLoan(validated.id);
      },
      updateLoan: async (_root, args: any, { user }) => {
        if (!user) throw new Error("Unauthorized");
        const validated = UpdateLoanSchema.parse(args);
        const { id, borrowerName, loanAmount, markupPercentage } = validated;
        return loanService.updateLoan(id, { borrowerName, loanAmount, markupPercentage });
      },
      registerBorrower: async (_root, args: any) => {
        const validated = RegisterBorrowerSchema.parse(args);
        return borrowerService.registerBorrower(validated);
      },
      requestLoan: async (_root, args: any, { user }) => {
        if (!user || user.role !== "user") throw new Error("Unauthorized");
        const { amount } = RequestLoanSchema.parse(args);
        return borrowerService.createLoanRequest(user.id, amount);
      },
      approveLoanRequest: async (_root, args: any, { user }) => {
        if (!user || user.role !== "admin") throw new Error("Unauthorized");
        const { id, note } = ApproveDeclineSchema.parse(args);
        return borrowerService.approve(id, user.id, note);
      },
      declineLoanRequest: async (_root, args: any, { user }) => {
        if (!user || user.role !== "admin") throw new Error("Unauthorized");
        const { id, note } = ApproveDeclineSchema.parse(args);
        return borrowerService.decline(id, user.id, note);
      }
    }
  };
};