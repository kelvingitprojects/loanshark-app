import { PrismaClient } from "@prisma/client";
import { calculateTotalOwed } from "../models/loan";

export class BorrowerService {
  constructor(private prisma: PrismaClient) {}

  async registerBorrower(input: { firstName: string; surname: string; phoneNumber: string; whatsappNumber?: string }) {
    const csrfToken = cryptoRandom();
    const borrower = await this.prisma.borrower.create({
      data: { ...input, csrfToken }
    });
    return borrower;
  }

  async createLoanRequest(borrowerId: string, amount: number) {
    return this.prisma.loanRequest.create({
      data: { borrowerId, amount },
      include: { borrower: true }
    });
  }

  async pendingLoanRequests() {
    return this.prisma.loanRequest.findMany({
      where: { status: "PENDING" },
      include: { borrower: true }
    });
  }

  async myLoanRequests(borrowerId: string) {
    return this.prisma.loanRequest.findMany({
      where: { borrowerId },
      orderBy: { createdAt: "desc" },
      include: { borrower: true }
    });
  }

  async getBorrowerById(id: string) {
    return this.prisma.borrower.findUnique({ where: { id } });
  }

  async listBorrowers() {
    return this.prisma.borrower.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  async approve(id: string, adminId?: string, note?: string) {
    const request = await this.prisma.loanRequest.update({
      where: { id },
      data: { status: "APPROVED", adminNote: note, decidedAt: new Date() },
      include: { borrower: true }
    });
    await this.prisma.auditLog.create({ data: { loanRequestId: id, action: "APPROVE", adminId, note } });
    // Automatically create a legacy Loan entry when a request is approved
    const borrowerName = `${request.borrower.firstName} ${request.borrower.surname}`.trim();
    const loanAmount = request.amount;
    const markupPercentage = 10; // default markup percentage for approved loans
    const totalOwed = calculateTotalOwed(loanAmount, markupPercentage);

    await this.prisma.loan.create({
      data: {
        borrowerName,
        loanAmount,
        markupPercentage,
        totalOwed
      }
    });
    await this.prisma.auditLog.create({ data: { loanRequestId: id, action: "CREATE_LOAN", adminId, note: `Auto-created loan (${loanAmount} @ ${markupPercentage}%)` } });
    return request;
  }

  async decline(id: string, adminId?: string, note?: string) {
    const request = await this.prisma.loanRequest.update({
      where: { id },
      data: { status: "DECLINED", adminNote: note, decidedAt: new Date() },
      include: { borrower: true }
    });
    await this.prisma.auditLog.create({ data: { loanRequestId: id, action: "DECLINE", adminId, note } });
    return request;
  }

  async statusForBorrower(borrowerId: string) {
    // Simple status resolution:
    // ACTIVE: at least one approved request
    // PENDING: at least one pending request and none approved
    // NEW: no requests yet or only declined
    const approved = await this.prisma.loanRequest.findFirst({ where: { borrowerId, status: "APPROVED" } });
    if (approved) return "ACTIVE";
    const pending = await this.prisma.loanRequest.findFirst({ where: { borrowerId, status: "PENDING" } });
    if (pending) return "PENDING";
    return "NEW";
  }
}

function cryptoRandom() {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}