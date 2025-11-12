import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env";

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    contentSecurityPolicy: false
  });

  // Build an allowlist from CORS_ORIGIN (comma-separated) when set.
  const allowed = (env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await fastify.register(cors, {
    origin: (origin, cb) => {
      // In dev or if no allowlist is set, allow all.
      if (!origin || allowed.length === 0 || env.NODE_ENV !== "production") {
        return cb(null, true);
      }
      const ok = allowed.includes(origin);
      cb(null, ok);
    },
    credentials: true
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });
});