import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { initDb } from "./backend/db.js";
import { typeDefs } from "./backend/schema.js";
import { resolvers } from "./backend/resolvers.js";

const PORT = process.env.PORT ?? 4000;

async function main() {
  await initDb();

  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
