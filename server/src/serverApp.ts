import Fastify from "fastify";
import mercurius, { MercuriusOptions } from "mercurius";
import cache from "mercurius-cache";
import securityPlugin from "./plugins/security";
import swaggerPlugin from "./plugins/swagger";
import monitoringPlugin from "./plugins/monitoring";
import validationPlugin from "./plugins/validation";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import { errorHandler } from "./utils/errors";
import healthRoutes from "./routes/health";
import viewRoutes from "./routes/view";
import authRoutes from "./routes/auth";
import { typeDefs } from "./graphql/schema";
import { buildResolvers } from "./graphql/resolvers";
import { LoanService } from "./services/loanService";
import { BorrowerService } from "./services/borrowerService";

export async function buildServer() {
  const server = Fastify({ logger: true });
  server.setErrorHandler(errorHandler);

  await server.register(securityPlugin);
  await server.register(swaggerPlugin);
  await server.register(monitoringPlugin);
  await server.register(validationPlugin);
  await server.register(prismaPlugin);
  await server.register(authPlugin);

  await server.register(healthRoutes);
  await server.register(viewRoutes);
  await server.register(authRoutes);

  const loanService = new LoanService(server.prisma);
  const borrowerService = new BorrowerService(server.prisma);
  const resolvers = buildResolvers(loanService, borrowerService);

  const graphqlOpts: MercuriusOptions = {
    schema: typeDefs,
    resolvers,
    graphiql: process.env.NODE_ENV !== "production",
    context: (req) => ({ user: req.user })
  };

  await server.register(mercurius, graphqlOpts);
  await server.register(cache, {
    policy: {
      Query: {
        loans: { ttl: 5 }
      }
    }
  });

  return server;
}