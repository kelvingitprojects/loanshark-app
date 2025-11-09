import fp from "fastify-plugin";
import { env } from "../config/env";

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string; role: "admin" | "user" } | null;
  }
}

export default fp(async (fastify) => {
  fastify.addHook("onRequest", async (req) => {
    const apiKey = req.headers["x-api-key"] as string | undefined;
    if (env.API_KEY && apiKey === env.API_KEY) {
      req.user = { id: "api-key-user", role: "admin" };
      return;
    }

    const borrowerId = req.headers["x-borrower-id"] as string | undefined;
    const csrf = req.headers["x-csrf-token"] as string | undefined;
    if (borrowerId && csrf) {
      try {
        const borrower = await fastify.prisma.borrower.findUnique({ where: { id: borrowerId } });
        if (borrower && borrower.csrfToken === csrf) {
          req.user = { id: borrower.id, role: "user" };
          return;
        }
      } catch {
        // ignore and treat as unauthorized
      }
    }

    req.user = null;
  });
});