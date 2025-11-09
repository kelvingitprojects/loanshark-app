import fp from "fastify-plugin";
import { env } from "../config/env";

export default fp(async (fastify) => {
  fastify.post('/api/admin/login', async (req, reply) => {
    try {
      const body = req.body as any;
      const email = String(body?.email || '');
      const password = String(body?.password || '');
      if (!env.API_KEY) return reply.status(401).send({ error: 'Unauthorized' });
      if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      return reply.send({ apiKey: env.API_KEY });
    } catch (e: any) {
      return reply.status(400).send({ error: 'Bad Request', message: e?.message || 'Invalid request' });
    }
  });
});