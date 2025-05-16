import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";
import envTokenAuth from "../middleware/envTokenAuth";

const authRoutes = Router();

authRoutes.post("/signup", envTokenAuth, UserController.store);
authRoutes.post("/login", SessionController.store);
authRoutes.post("/refresh_token", SessionController.update);
authRoutes.get("/me", isAuth, SessionController.me);
authRoutes.delete("/logout", isAuth, SessionController.remove);

export default authRoutes;
