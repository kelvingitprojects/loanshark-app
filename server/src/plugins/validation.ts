import fp from "fastify-plugin";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default fp(async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>();
});