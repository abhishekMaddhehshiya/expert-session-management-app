import { Router } from "express";
import { signup, login, getMe } from "../controllers/authController.ts";
import { protect } from "../middleware/authMiddleware.ts";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
