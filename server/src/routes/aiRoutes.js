import express from "express";
import { suggestEstimate } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/suggest-estimate", protect, suggestEstimate);

export default router;
