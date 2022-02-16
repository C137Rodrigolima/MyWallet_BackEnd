import express, { json } from "express";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
import transactionsRouter from "./routes/transactionsRouter.js";

const server = express();
server.use(cors());
server.use(json());

server.use(authRouter);
server.use(transactionsRouter);

server.listen(process.env.PORT, ()=>{
    console.log(`Listening on port ${process.env.PORT}`)
});