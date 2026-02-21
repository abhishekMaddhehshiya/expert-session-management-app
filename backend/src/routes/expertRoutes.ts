import { Router } from "express";
import { getExperts, getExpertById, getCategories, getMySlots, toggleSlot } from "../controllers/expertController.ts";
import { protect, expertOnly } from "../middleware/authMiddleware.ts";

const router = Router();

router.get("/categories", getCategories);
router.get("/my-slots", protect, expertOnly, getMySlots);
router.post("/my-slots/toggle", protect, expertOnly, toggleSlot);
router.get("/", getExperts);
router.get("/:id", getExpertById);

export default router;
