import { FastifyInstance } from "fastify";

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", {
    schema: {
      description: "Health check",
      response: {
        200: {
          type: "object",
          properties: { status: { type: "string" } }
        }
      }
    }
  }, async () => ({ status: "ok" }));
}