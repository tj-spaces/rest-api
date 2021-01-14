import { Router } from "express";
import * as spaces from "./spaces/index";

const router = Router();

router.use("/spaces", spaces.router);

export { router };
