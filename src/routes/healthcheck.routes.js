import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js";
import { upload } from "../middlewares/multers.middlewares.js";

const router = Router()

router.route("/health").get(healthcheck);

export default router;