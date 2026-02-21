import { Router } from "express";
import {
    createBooking,
    respondToBooking,
    cancelBooking,
    getMyBookings,
    getExpertBookings,
} from "../controllers/bookingController.ts";
import { protect, expertOnly } from "../middleware/authMiddleware.ts";

const router = Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get("/expert", protect, expertOnly, getExpertBookings);
router.patch("/:id/respond", protect, expertOnly, respondToBooking);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
