import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } }
  });

  await prisma.$connect();
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
});