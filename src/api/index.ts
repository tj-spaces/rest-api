import { Router } from "express";
import * as spaces from "./spaces/index";
import * as groups from "./groups/index";

const router = Router();

router.use("/spaces", spaces.router);
router.use("/groups", groups.router);

export { router };
