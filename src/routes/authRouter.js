import { Router } from "express";
import { signIn, signUp } from "../controllers/authController.js";
import { loginValidate } from "../midleware/loginValidate.js";
import { registerValidate } from "../midleware/registerValidate.js";

const authRouter = Router();
authRouter.post('/', loginValidate, signIn);
authRouter.post('/sign-up', registerValidate, signUp);
export default authRouter;