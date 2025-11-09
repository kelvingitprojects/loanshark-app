import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export async function errorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  const statusCode = error.statusCode ?? 500;
  const payload = {
    statusCode,
    error: error.name || "Error",
    message: error.message
  };
  reply.status(statusCode).send(payload);
}