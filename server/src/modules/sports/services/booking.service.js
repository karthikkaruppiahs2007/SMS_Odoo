import prisma from "../../../config/prisma.js";
import { parseKolkataToUTC, formatUTCToKolkata } from "../utils/slot.utils.js";
import { calculateBookingPrice, getSportPricing } from "./pricing.service.js";
import { broadcastBookingEvent } from "../sockets/booking.socket.js";

/**
 * 1. Create Temporary Booking Hold (3 Minutes):
 * Concurrency-safe hold creation protected by PostgreSQL transaction and row-level locking.
 */
export const createBookingHold = async ({
  userId,
  sport,
  date,
  startTime,
  playerCount = 1,
}) => {
  const normalizedSport = (sport || "").toUpperCase();
  const count = parseInt(playerCount, 10);

  if (!normalizedSport) {
    throw new Error("Sport is required");
  }
  if (!date || !startTime) {
    throw new Error("Date (YYYY-MM-DD) and startTime (HH:mm) are required");
  }
  if (isNaN(count) || count < 1) {
    throw new Error("Player count must be at least 1");
  }

  // Parse slot start and end times in UTC
  const slotStartTime = parseKolkataToUTC(date, startTime);
  const slotEndTime = new Date(slotStartTime.getTime() + 30 * 60 * 1000);
  const now = new Date();

  // Validate not in past
  if (slotStartTime.getTime() <= now.getTime()) {
    throw new Error("Cannot book slots in the past");
  }

  // Get user membership for dynamic pricing
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, membership: true, amount: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate dynamic pricing
  const pricingData = await calculateBookingPrice(
    normalizedSport,
    user.membership,
    count
  );

  const holdExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

  // Execute in serializable/locked transaction to protect capacity
  const holdBooking = await prisma.$transaction(async (tx) => {
    // 1. Ensure a Slot row exists for this court and time
    const slot = await tx.slot.upsert({
      where: {
        whichCourt_startTime: {
          whichCourt: normalizedSport,
          startTime: slotStartTime,
        },
      },
      update: {
        maxCapacity: pricingData.capacity,
      },
      create: {
        whichCourt: normalizedSport,
        startTime: slotStartTime,
        endTime: slotEndTime,
        maxCapacity: pricingData.capacity,
      },
    });

    // 2. Lock the Slot row exclusively using FOR UPDATE
    await tx.$queryRaw`
      SELECT "id" FROM "Slot" 
      WHERE "id" = ${slot.id} 
      FOR UPDATE
    `;

    // 3. Count currently occupied capacity (CONFIRMED + active HELD)
    const occupiedRows = await tx.$queryRaw`
      SELECT COALESCE(SUM("playerCount"), 0)::int as occupied
      FROM "SportsBooking"
      WHERE "whichCourt" = ${normalizedSport}::"CourtType"
        AND "slot" = ${slotStartTime}
        AND (
          "status" = 'CONFIRMED'
          OR ("status" = 'HELD' AND "expiresAt" > NOW())
        )
    `;

    const currentlyOccupied = occupiedRows[0]?.occupied || 0;
    const remainingCapacity = pricingData.capacity - currentlyOccupied;

    if (count > remainingCapacity) {
      throw new Error(
        `Insufficient capacity. Requested ${count} place(s), but only ${remainingCapacity} available.`
      );
    }

    // 4. Create the HELD booking record
    return tx.sportsBooking.create({
      data: {
        userID: userId,
        whichCourt: normalizedSport,
        slot: slotStartTime,
        endTime: slotEndTime,
        playerCount: count,
        basePrice: pricingData.basePrice,
        discountPercentage: pricingData.discountPercentage,
        totalAmount: pricingData.totalAmount,
        status: "HELD",
        expiresAt: holdExpiresAt,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, membership: true },
        },
      },
    });
  });

  // Broadcast real-time availability update
  broadcastBookingEvent("booking:hold_created", normalizedSport, date, {
    bookingId: holdBooking.id,
    slot: startTime,
    playerCount: count,
  });

  return {
    ...holdBooking,
    holdDurationMinutes: 3,
    expiresInSeconds: 180,
  };
};

/**
 * 2. Confirm Booking Hold:
 * Deducts booking totalAmount from User.amount wallet and updates status to CONFIRMED.
 */
export const confirmBookingHold = async ({ userId, holdId }) => {
  if (!holdId) {
    throw new Error("Hold ID is required");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch hold booking
    const booking = await tx.sportsBooking.findUnique({
      where: { id: holdId },
      include: { user: true },
    });

    if (!booking) {
      throw new Error("Booking hold not found");
    }

    if (booking.userID !== userId) {
      throw new Error("You do not have permission to confirm this hold");
    }

    if (booking.status === "CONFIRMED") {
      throw new Error("Booking is already confirmed");
    }

    if (booking.status !== "HELD") {
      throw new Error(`Cannot confirm booking with status '${booking.status}'`);
    }

    // 2. Validate hold expiry
    const now = new Date();
    if (!booking.expiresAt || booking.expiresAt.getTime() <= now.getTime()) {
      await tx.sportsBooking.update({
        where: { id: holdId },
        data: { status: "EXPIRED" },
      });
      throw new Error("Hold has expired. Please select the slot again.");
    }

    // 3. Lock user row and check balance
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    const userBalance = Number(user.amount);
    const bookingCost = Number(booking.totalAmount);

    if (userBalance < bookingCost) {
      throw new Error(
        `Insufficient membership balance. Required: ₹${bookingCost}, Available: ₹${userBalance}. Please recharge your balance.`
      );
    }

    // 4. Deduct balance from user wallet
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        amount: {
          decrement: bookingCost,
        },
      },
    });

    // 5. Update booking status to CONFIRMED
    const confirmedBooking = await tx.sportsBooking.update({
      where: { id: holdId },
      data: {
        status: "CONFIRMED",
        expiresAt: null,
      },
    });

    return {
      booking: confirmedBooking,
      remainingBalance: Number(updatedUser.amount),
    };
  });

  const { date } = formatUTCToKolkata(result.booking.slot);
  broadcastBookingEvent(
    "booking:confirmed",
    result.booking.whichCourt,
    date,
    {
      bookingId: result.booking.id,
      playerCount: result.booking.playerCount,
    }
  );

  return result;
};

/**
 * 3. Release/Cancel Active Hold Early:
 */
export const releaseBookingHold = async ({ userId, holdId }) => {
  const booking = await prisma.sportsBooking.findUnique({
    where: { id: holdId },
  });

  if (!booking) {
    throw new Error("Hold not found");
  }

  if (booking.userID !== userId) {
    throw new Error("Unauthorized to release this hold");
  }

  if (booking.status !== "HELD") {
    throw new Error("Only HELD reservations can be released");
  }

  const updated = await prisma.sportsBooking.update({
    where: { id: holdId },
    data: { status: "EXPIRED" },
  });

  const { date } = formatUTCToKolkata(booking.slot);
  broadcastBookingEvent("booking:hold_expired", booking.whichCourt, date, {
    bookingId: holdId,
  });

  return updated;
};

/**
 * 4. Cancel Confirmed Booking with 50% Refund:
 * Allowed up to 1 hour before the slot starts.
 */
export const cancelConfirmedBooking = async ({ userId, bookingId, role }) => {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.sportsBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (role !== "ADMIN" && booking.userID !== userId) {
      throw new Error("You do not have permission to cancel this booking");
    }

    if (booking.status !== "CONFIRMED") {
      throw new Error(
        `Cannot cancel booking with status '${booking.status}'. Only CONFIRMED bookings can be cancelled.`
      );
    }

    // Cancellation window: 1 hour before slot start
    const now = new Date();
    const timeUntilSlotMs = booking.slot.getTime() - now.getTime();
    const oneHourMs = 60 * 60 * 1000;

    if (timeUntilSlotMs < oneHourMs) {
      throw new Error(
        "Cancellation is only allowed up to 1 hour before the slot start time."
      );
    }

    // Refund policy: 50% of original total amount
    const originalCost = Number(booking.totalAmount);
    const refundAmount = Math.round((originalCost * 0.5) * 100) / 100;

    // Refund 50% back into user's User.amount balance
    const updatedUser = await tx.user.update({
      where: { id: booking.userID },
      data: {
        amount: {
          increment: refundAmount,
        },
      },
    });

    // Mark booking as CANCELLED
    const cancelledBooking = await tx.sportsBooking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
      },
    });

    return {
      booking: cancelledBooking,
      refundAmount,
      updatedBalance: Number(updatedUser.amount),
    };
  });

  const { date } = formatUTCToKolkata(result.booking.slot);
  broadcastBookingEvent("booking:cancelled", result.booking.whichCourt, date, {
    bookingId: result.booking.id,
    playerCount: result.booking.playerCount,
  });

  return result;
};

/**
 * 5. Get My Bookings:
 */
export const getUserBookings = async (userId) => {
  return prisma.sportsBooking.findMany({
    where: { userID: userId },
    orderBy: { slot: "desc" },
  });
};

/**
 * 6. Get Booking By ID:
 */
export const getBookingById = async (userId, bookingId, role) => {
  const booking = await prisma.sportsBooking.findUnique({
    where: { id: bookingId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, membership: true },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (role !== "ADMIN" && booking.userID !== userId) {
    throw new Error("Unauthorized to view this booking");
  }

  return booking;
};

/**
 * 7. Get All Bookings (with optional filters & pagination):
 * Allows filtering by sport, status, date, and user ID.
 */
export const getAllBookings = async ({
  sport,
  status,
  date,
  userId,
  page = 1,
  limit = 20,
} = {}) => {
  const where = {};

  if (sport) {
    where.whichCourt = sport.toUpperCase();
  }

  if (status) {
    where.status = status.toUpperCase();
  }

  if (userId) {
    where.userID = userId;
  }

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    where.slot = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const takeNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * takeNum;

  const [bookings, total] = await Promise.all([
    prisma.sportsBooking.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, membership: true },
        },
      },
      orderBy: { slot: "desc" },
      skip,
      take: takeNum,
    }),
    prisma.sportsBooking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page: pageNum,
      limit: takeNum,
      total,
      totalPages: Math.ceil(total / takeNum) || 1,
    },
  };
};
