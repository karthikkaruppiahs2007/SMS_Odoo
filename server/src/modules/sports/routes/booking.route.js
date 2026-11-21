import { Router } from "express";
import {
  createHold,
  confirmHold,
  releaseHold,
  getAllBookings,
  getMyBookings,
  getBooking,
  cancelBooking,
} from "../controllers/booking.controller.js";
import { authenticate } from "../../../common/middlewares/auth.middleware.js";

const router = Router();

// All booking operations require an authenticated member
router.get("/", authenticate, getAllBookings);
router.post("/hold", authenticate, createHold);
router.post("/confirm", authenticate, confirmHold);
router.delete("/hold/:id", authenticate, releaseHold);
router.get("/my-bookings", authenticate, getMyBookings);
router.get("/:id", authenticate, getBooking);
router.post("/:id/cancel", authenticate, cancelBooking);

export default router;
