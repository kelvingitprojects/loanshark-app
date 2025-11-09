import { env } from "./config/env";
import { buildServer } from "./serverApp";

async function start() {
  const server = await buildServer();
  const port = Number(env.PORT);
  try {
    await server.listen({ port, host: "0.0.0.0" });
    server.log.info(`Fastify server listening at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();