import {
  createBookingHold,
  confirmBookingHold,
  releaseBookingHold,
  cancelConfirmedBooking,
  getUserBookings,
  getBookingById,
  getAllBookings as getAllBookingsService,
} from "../services/booking.service.js";

/**
 * GET /api/bookings
 * Get all booking details with optional filters (sport, status, date, userId, page, limit).
 * Admins and sub-admins see all bookings; members see their own by default.
 */
export const getAllBookings = async (req, res) => {
  try {
    const { sport, status, date, userId, page, limit } = req.query || {};
    const role = req.user.role;

    // Regular members can only view their own bookings; ADMIN/SUBADMIN can query any userId or all
    const targetUserId = role === "ADMIN" || role === "SUBADMIN" ? userId : req.user.id;

    const result = await getAllBookingsService({
      sport,
      status,
      date,
      userId: targetUserId,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: error.message,
    });
  }
};

/**
 * POST /api/bookings/hold
 * Create a 3-minute temporary capacity hold.
 */
export const createHold = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sport, date, startTime, playerCount } = req.body;

    const hold = await createBookingHold({
      userId,
      sport,
      date,
      startTime,
      playerCount,
    });

    return res.status(201).json({
      message: "Slot held successfully for 3 minutes. Please confirm to finalize booking.",
      hold,
    });
  } catch (error) {
    console.error("Create hold error:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * POST /api/bookings/confirm
 * Confirm booking and deduct booking amount from User.amount wallet.
 */
export const confirmHold = async (req, res) => {
  try {
    const userId = req.user.id;
    const { holdId, bookingId } = req.body;
    const id = holdId || bookingId;

    if (!id) {
      return res.status(400).json({ message: "holdId is required to confirm booking" });
    }

    const result = await confirmBookingHold({
      userId,
      holdId: id,
    });

    return res.status(200).json({
      message: "Booking confirmed successfully. Payment deducted from membership balance.",
      ...result,
    });
  } catch (error) {
    console.error("Confirm hold error:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE /api/bookings/hold/:id
 * Release an active hold early.
 */
export const releaseHold = async (req, res) => {
  try {
    const userId = req.user.id;
    const holdId = req.params.id;

    await releaseBookingHold({
      userId,
      holdId,
    });

    return res.status(200).json({ message: "Hold released successfully." });
  } catch (error) {
    console.error("Release hold error:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/bookings/my-bookings
 * Get all bookings for the authenticated user.
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await getUserBookings(userId);
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res.status(500).json({ message: "Failed to retrieve bookings", error: error.message });
  }
};

/**
 * GET /api/bookings/:id
 * Get single booking details.
 */
export const getBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const bookingId = req.params.id;

    const booking = await getBookingById(userId, bookingId, role);
    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    return res.status(404).json({ message: error.message });
  }
};

/**
 * POST /api/bookings/:id/cancel
 * Cancel confirmed booking with 50% refund to wallet.
 */
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const bookingId = req.params.id;

    const result = await cancelConfirmedBooking({
      userId,
      bookingId,
      role,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(400).json({ message: error.message });
  }
};
