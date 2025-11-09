import { z } from "zod";

export const AddLoanSchema = z.object({
  borrowerName: z.string().min(1),
  loanAmount: z.number().positive(),
  markupPercentage: z.number().min(0).max(100)
});

export const AddRepaymentSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.number().positive()
});

export const DeleteLoanSchema = z.object({ id: z.string().uuid() });

export const UpdateLoanSchema = z.object({
  id: z.string().uuid(),
  borrowerName: z.string().min(1).optional(),
  loanAmount: z.number().positive().optional(),
  markupPercentage: z.number().min(0).max(100).optional()
}).refine((data) => data.borrowerName !== undefined || data.loanAmount !== undefined || data.markupPercentage !== undefined, {
  message: "At least one field must be provided to update",
  path: ["borrowerName"]
});

export const RegisterBorrowerSchema = z.object({
  firstName: z.string().min(1),
  surname: z.string().min(1),
  phoneNumber: z.string().min(7),
  whatsappNumber: z.string().min(7).optional()
});

export const RequestLoanSchema = z.object({ amount: z.number().min(50).max(100000) });

export const ApproveDeclineSchema = z.object({ id: z.string().uuid(), note: z.string().max(500).optional() });

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});