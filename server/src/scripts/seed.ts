import { PrismaClient } from "@prisma/client";
import { calculateTotalOwed } from "../models/loan";

async function main() {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.loan.count();
    if (existing > 0) {
      console.log(`Seed skipped: ${existing} loans already exist`);
      return;
    }

    const aliceTotal = calculateTotalOwed(1000, 10);
    const bobTotal = calculateTotalOwed(500, 5);

    const alice = await prisma.loan.create({
      data: {
        borrowerName: "Alice",
        loanAmount: 1000,
        markupPercentage: 10,
        totalOwed: aliceTotal
      }
    });

    const bob = await prisma.loan.create({
      data: {
        borrowerName: "Bob",
        loanAmount: 500,
        markupPercentage: 5,
        totalOwed: bobTotal
      }
    });

    await prisma.repayment.create({ data: { loanId: alice.id, amount: 200 } });
    await prisma.repayment.create({ data: { loanId: alice.id, amount: 150 } });
    await prisma.repayment.create({ data: { loanId: bob.id, amount: 50 } });

    console.log("Seed complete: created demo loans and repayments");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});