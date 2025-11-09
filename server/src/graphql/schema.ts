export const typeDefs = `
  type AdminAuth { apiKey: String! }
  type Borrower {
    id: ID!
    firstName: String!
    surname: String!
    phoneNumber: String!
    whatsappNumber: String
    csrfToken: String!
    createdAt: String!
    status: String!
  }

  type LoanRequest {
    id: ID!
    amount: Float!
    status: String!
    adminNote: String
    createdAt: String!
    updatedAt: String!
    decidedAt: String
    borrower: Borrower!
  }

  type AuditLog {
    id: ID!
    action: String!
    note: String
    adminId: String
    createdAt: String!
  }
  type Repayment {
    id: ID!
    amount: Float!
    date: String!
    borrowerName: String!
  }

  type Loan {
    id: ID!
    borrowerName: String!
    loanAmount: Float!
    markupPercentage: Float!
    totalOwed: Float!
    totalRepaid: Float!
    createdAt: String!
    repayments: [Repayment!]!
  }

  type DeletePayload { id: ID! }

  type Query {
    loans: [Loan!]!
    pendingLoanRequests: [LoanRequest!]!
    myLoanRequests: [LoanRequest!]!
    myLoans: [Loan!]!
    borrowers: [Borrower!]!
    repayments: [Repayment!]!
  }

  type Mutation {
    addLoan(borrowerName: String!, loanAmount: Float!, markupPercentage: Float!): Loan!
    addRepayment(loanId: ID!, amount: Float!): Loan!
    updateLoan(id: ID!, borrowerName: String, loanAmount: Float, markupPercentage: Float): Loan!
    deleteLoan(id: ID!): DeletePayload!
    
    registerBorrower(firstName: String!, surname: String!, phoneNumber: String!, whatsappNumber: String): Borrower!
    requestLoan(amount: Float!): LoanRequest!
    approveLoanRequest(id: ID!, note: String): LoanRequest!
    declineLoanRequest(id: ID!, note: String): LoanRequest!

    adminLogin(email: String!, password: String!): AdminAuth!
  }
`;