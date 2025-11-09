import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (fastify) => {
  const logger = pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transport: process.env.NODE_ENV !== "production" ? {
      target: "pino-pretty",
      options: { colorize: true }
    } : undefined
  });

  fastify.log = logger as any;
});