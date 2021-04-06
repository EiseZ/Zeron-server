import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import cookieParser from "cookie-parser";
import { PostResolver } from "./resolvers/post";
import cors from "cors";

async function main() {
  const conn = await createConnection();

  const app = express();

  app.use(cookieParser("3hb97da3u232u9ghfbu9683f"));
  app.use(
    cors({
      origin: "http://localhost:3000/",
      credentials: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      manager: conn.manager,
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.get("/", (_, res) => {
    res.send("Hello");
  });

  app.listen(4000, () => {
    console.log("🚀 Server started on localhost:4000");
  });
}

main();
