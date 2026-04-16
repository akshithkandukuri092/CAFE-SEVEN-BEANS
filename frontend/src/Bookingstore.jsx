// ── Bookingstore.jsx ─────────────────────────────────────────────
// Slot key: sb_slots_${date}_${unitId}_${slotTime}
// Value   : bookingId  (absent = free)
//
// Cancellation policy:
//   - Food pre-order: 100% non-refundable
//   - Space charge:   30% non-refundable (70% refunded)

const BOOKINGS_KEY = (uid) => `sb_bookings_${uid}`;
const REVIEWS_KEY = () => `sb_reviews_public`;

function slotKey(date, unitId, slotTime) {
  return `sb_slots_${date}_${unitId}_${slotTime}`;
}

export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

// ── UNIT DEFINITIONS ─────────────────────────────────────────────

export const UNITS_FOR_TYPE = {
  workspace: Array.from({ length: 12 }, (_, i) => ({
    id: `workspace-${i + 1}`,
    label: `Pod ${i + 1}`,
    icon: "💼",
  })),
  birthday: [
    { id: "birthday-1", label: "Hall A", icon: "🎂" },
    { id: "birthday-2", label: "Hall B", icon: "🎂" },
  ],
  conference: [
    { id: "conference-1", label: "Room 1", icon: "🤝" },
    { id: "conference-2", label: "Room 2", icon: "🤝" },
  ],
  cafe: [
    { id: "cafe-1", label: "Café", icon: "☕" },
  ],
};

// ── SLOT STATUS ───────────────────────────────────────────────────

export function getSlotBooking(date, unitId, slotTime) {
  if (date < getTodayString()) return null;
  return localStorage.getItem(slotKey(date, unitId, slotTime)) || null;
}

export function isSlotBooked(date, unitId, slotTime) {
  return !!getSlotBooking(date, unitId, slotTime);
}

export function getUnitSlotStatus(date, unitId, slotTime) {
  const today = getTodayString();
  if (date < today) return "past";
  if (date === today) {
    const now = new Date();
    const [h, m] = slotTime.split(":").map(Number);
    if (now.getHours() * 60 + now.getMinutes() >= h * 60 + m) return "past";
  }
  return isSlotBooked(date, unitId, slotTime) ? "booked" : "free";
}

export function getAvailabilityMap(spaceType, date, slots) {
  const units = UNITS_FOR_TYPE[spaceType] || [];
  const map = {};
  for (const unit of units) {
    map[unit.id] = {};
    for (const slot of slots) {
      map[unit.id][slot] = getUnitSlotStatus(date, unit.id, slot);
    }
  }
  return map;
}

function occupySlot(date, unitId, slotTime, bookingId) {
  if (date < getTodayString()) return;
  localStorage.setItem(slotKey(date, unitId, slotTime), bookingId);
}

function freeSlot(date, unitId, slotTime) {
  localStorage.removeItem(slotKey(date, unitId, slotTime));
}

// ── BOOKINGS ──────────────────────────────────────────────────────

export function getBookings(uid) {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY(uid));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveBooking(uid, booking) {
  const { unitId, spaceId, date, slots } = booking;
  if (!unitId) throw new Error("NO_UNIT_SELECTED");

  // Check all slots are free
  if (spaceId !== "cafe") {
    const slotArr = Array.isArray(slots) ? slots : [booking.slot];
    for (const s of slotArr) {
      if (isSlotBooked(date, unitId, s)) throw new Error("NO_UNIT_AVAILABLE");
    }
  }

  const id = `bk_${Date.now()}`;
  const record = {
    ...booking,
    id,
    createdAt: new Date().toISOString(),
    status: "confirmed",
  };

  // Occupy all slots
  const slotArr = Array.isArray(slots) ? slots : [booking.slot];
  for (const s of slotArr) {
    occupySlot(date, unitId, s, id);
  }

  const all = getBookings(uid);
  localStorage.setItem(BOOKINGS_KEY(uid), JSON.stringify([record, ...all]));
  return record;
}

/**
 * Cancellation policy:
 * - Food total: 100% non-refundable
 * - Space charge: 30% non-refundable, 70% refunded
 * Returns { refundAmount, nonRefundAmount, foodTotal, spaceNonRefund }
 */
export function getCancellationBreakdown(booking) {
  const foodTotal = booking.foodTotal || 0;
  const spacePrice = booking.spacePrice || 0;
  const spaceNonRefund = Math.round(spacePrice * 0.30);
  const spaceRefund = spacePrice - spaceNonRefund;
  const refundAmount = spaceRefund;
  const nonRefundAmount = foodTotal + spaceNonRefund;
  return { refundAmount, nonRefundAmount, foodTotal, spaceNonRefund, spacePrice };
}

export function cancelBooking(uid, bookingId) {
  const all = getBookings(uid).map(b => {
    if (b.id === bookingId) {
      const slotArr = Array.isArray(b.slots) ? b.slots : (b.slot ? [b.slot] : []);
      for (const s of slotArr) {
        if (b.unitId && b.date && s) freeSlot(b.date, b.unitId, s);
      }
      const breakdown = getCancellationBreakdown(b);
      return { ...b, status: "cancelled", cancellationBreakdown: breakdown, cancelledAt: new Date().toISOString() };
    }
    return b;
  });
  localStorage.setItem(BOOKINGS_KEY(uid), JSON.stringify(all));
}

// ── REVIEWS ───────────────────────────────────────────────────────

export function getReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveReview(review) {
  const all = getReviews();
  const filtered = all.filter(r => r.bookingId !== review.bookingId);
  const record = { ...review, id: `rv_${Date.now()}`, createdAt: new Date().toISOString() };
  localStorage.setItem(REVIEWS_KEY(), JSON.stringify([record, ...filtered]));
  return record;
}

export function hasReviewed(bookingId) {
  return getReviews().some(r => r.bookingId === bookingId);
}