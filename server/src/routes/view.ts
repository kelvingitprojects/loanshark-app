import { FastifyInstance } from "fastify";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EmailTemplate } from "../views/EmailTemplate";

export default async function viewRoutes(fastify: FastifyInstance) {
  fastify.get("/render-test", async (_req, reply) => {
    const html = renderToStaticMarkup(
      React.createElement(EmailTemplate, { borrower: "Alice", amount: 100 })
    );
    reply.type("text/html").send("<!doctype html>" + html);
  });
}