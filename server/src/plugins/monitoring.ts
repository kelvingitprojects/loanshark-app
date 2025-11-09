import fp from "fastify-plugin";
import underPressure from "@fastify/under-pressure";
import { Registry, collectDefaultMetrics } from "prom-client";

export default fp(async (fastify) => {
  await fastify.register(underPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 1000 * 1024 * 1024,
    maxRssBytes: 1000 * 1024 * 1024,
    healthCheckInterval: 500,
    healthCheck: async () => {
      return { status: "ok" };
    }
  });

  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  fastify.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", registry.contentType);
    return registry.metrics();
  });
});