import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { buildServer } from "../src/serverApp";
import { env } from "../src/config/env";

let server: Awaited<ReturnType<typeof buildServer>>;

beforeAll(async () => {
  process.env.API_KEY = env.API_KEY || "test-key";
  server = await buildServer();
});

afterAll(async () => {
  await server.close();
});

describe("GraphQL schema", () => {
  it("rejects unauthorized requests", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/graphql",
      payload: { query: "{ loans { id } }" }
    });
    expect(res.statusCode).toBe(200); // GraphQL returns 200 with errors
    const body = res.json();
    expect(body.errors?.[0]?.message).toBe("Unauthorized");
  });
});