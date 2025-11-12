import type { FastifyInstance } from "fastify";

export default async function rootRoutes(server: FastifyInstance) {
  server.route({
    method: ["GET", "HEAD"],
    url: "/",
    handler: async (_req, reply) => {
      reply.code(200).send({ status: "ok" });
    },
  });
}