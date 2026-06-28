import express from "express";
import { getBoards, createBoard, getBoard, updateBoard, deleteBoard } from "../controllers/boardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getBoards).post(createBoard);
router.route("/:id").get(getBoard).put(updateBoard).delete(deleteBoard);

export default router;
