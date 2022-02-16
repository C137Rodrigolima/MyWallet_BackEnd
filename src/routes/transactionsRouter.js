import { Router } from "express";
import { getTransactions, postTransactions } from "../controllers/transactionsController.js";
import { tokenValidate } from "../midleware/tokenValidate.js";
import { transationValidate } from "../midleware/transationValidate.js";

const transactionsRouter = Router();
transactionsRouter.get('/transaction-record', tokenValidate, getTransactions);
transactionsRouter.post('/sendTransaction', tokenValidate, transationValidate, postTransactions)
export default transactionsRouter;