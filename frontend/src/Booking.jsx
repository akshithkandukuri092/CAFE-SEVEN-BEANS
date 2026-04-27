import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {

  UNITS_FOR_TYPE,
  getTodayString,
} from "./Bookingstore";
import "./Booking.css";

// ── Space definitions ─────────────────────────────────────────────
export const SPACES = [
  {
    id: "workspace",
    icon: "💼",
    label: "Focus Workspace",
    desc: "12 private pods — high-speed WiFi, ergonomic seating",
    priceUnit: "per hour",
    price: 149,
    maxGuests: 4,
    advanceMinutes: 45,          // must book 45 min before slot
    slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
    multiSlot: true,             // user can select multiple consecutive slots
  },
  {
    id: "birthday",
    icon: "🎂",
    label: "Birthday Hall",
    desc: "2 event halls — décor packages & dedicated host",
    priceUnit: "per hour",
    price: 2499,
    maxGuests: 40,
    advanceMinutes: 60,          // must book 1 hour before slot
    slots: ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
    multiSlot: true,
    durationHoursPerSlot: 2,    // each slot = 2 hrs
  },
  {
    id: "conference",
    icon: "🤝",
    label: "Conference Room",
    desc: "2 professional rooms — AV, whiteboard & projector",
    priceUnit: "per hour",
    price: 799,
    maxGuests: 20,
    advanceMinutes: 45,
    slots: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    multiSlot: true,
  },
  {
    id: "cafe",
    icon: "☕",
    label: "Just Coffee",
    desc: "Drop in, grab a seat, enjoy artisan brews",
    priceUnit: "no booking fee",
    price: 0,
    maxGuests: 6,
    advanceMinutes: 0,
    slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    multiSlot: false,
  },
];

export const MENU_ITEMS = [
  { id: "m1", cat: "Bites", name: "Chip an Dip", desc: "Potato chips with tzatziki", price: 150 },
  { id: "m2", cat: "Bites", name: "Nachos", desc: "Crispy nachos with salsa & cheese", price: 200 },
  { id: "m3", cat: "Bites", name: "Woodfired Garlic Bread", desc: "Rustic garlic bread from the oven", price: 150 },
  { id: "m4", cat: "Bites", name: "Crunchy Nuggets", desc: "Crumb-coated vegetarian nuggets", price: 150 },
  { id: "m5", cat: "Bites", name: "French Fries", desc: "Classic peri-peri / sriracha chilli", price: 150 },
  { id: "m6", cat: "Bites", name: "Grilled Corn Ribs", desc: "Oven grilled corn, chilli garlic & lime", price: 180 },
  { id: "m7", cat: "Toasties", name: "Cheese Chilli Toast", desc: "Cheese, chilli, chopped capsicum", price: 180 },
  { id: "m8", cat: "Toasties", name: "Avocado Toast", desc: "Avocado mash with vegetable spread", price: 225 },
  { id: "m9", cat: "Toasties", name: "Corn & Cheese Sandwich", desc: "Sweet corn and melted cheese", price: 180 },
  { id: "m10", cat: "Toasties", name: "Paneer Tikka Sandwich", desc: "Onions, tomato & mint chutney", price: 200 },
  { id: "m11", cat: "Pizzas", name: "Margherita", desc: "Tomato sauce and mozzarella", price: 325 },
  { id: "m12", cat: "Pizzas", name: "Corn and Cheese", desc: "Corn, cheese and mozzarella", price: 350 },
  { id: "m13", cat: "Pizzas", name: "Tandoori Paneer", desc: "Tandoori paneer, onion, capsicum & mozzarella", price: 395 },
  { id: "m14", cat: "Pizzas", name: "Mushroom Delight", desc: "White sauce, button mushrooms, black olives", price: 395 },
  { id: "m15", cat: "Pasta", name: "Arrabiata", desc: "Garlic, capsicum, babycorn in tomato sauce", price: 250 },
  { id: "m16", cat: "Pasta", name: "Alfredo", desc: "Corn, broccoli in creamy white sauce", price: 250 },
  { id: "m17", cat: "Pasta", name: "Pesto", desc: "Pasta with classic basil pesto sauce", price: 250 },
  { id: "m18", cat: "Health", name: "Sautéed Veggies", desc: "Seasonal vegetables in olive oil", price: 225 },
  { id: "m19", cat: "Health", name: "Granola Bowl", desc: "Crunchy granola with yogurt & fresh fruits", price: 250 },
  { id: "m20", cat: "Health", name: "Green Salad", desc: "A mix of fresh garden greens", price: 180 },
  { id: "m21", cat: "Health", name: "Caesar Salad", desc: "Lettuce, parmesan & croutons", price: 225 },
  { id: "m22", cat: "Health", name: "Greek Salad", desc: "Cucumbers, olives, cherry tomato & feta", price: 225 },
];

const STEPS = ["Space & Date", "Pick Your Seat", "Food Pre-order", "Review & Confirm"];

function formatTime(t) {
  if (!t) return "";   // ✅ prevent crash

  const [h] = t.toString().split(":");
  const hour = parseInt(h);

  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;

  return `${display} ${suffix}`;
}

function slotToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Check if a slot is within advance booking restriction */
function isSlotTooSoon(date, slotTime, advanceMinutes) {
  if (advanceMinutes === 0) return false;
  const today = getTodayString();
  if (date !== today) return false;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const slotMins = slotToMinutes(slotTime);
  return slotMins - nowMins < advanceMinutes;
}

// ── Multi-slot SeatMap ────────────────────────────────────────────
function SeatMap({ space, date, selectedUnit, selectedSlots, onSelect, refreshKey }) {
  const [availMap, setAvailMap] = useState({});
  const units = UNITS_FOR_TYPE[space.id] || [];

  // ✅ BACKEND AVAILABILITY
  useEffect(() => {
    // Fetch availability on load or when space/date changes
    fetch(`http://localhost:5000/availability?space=${space.label}&date=${date}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setAvailMap({});
          return;
        }

        const map = {};

        data.forEach(b => {
          if (!map[b.unit_id]) map[b.unit_id] = {};

          for (let i = b.start_time; i < b.end_time; i++) {
            const slot = `${String(i).padStart(2, "0")}:00`;
            map[b.unit_id][slot] = "booked";
          }
        });

        setAvailMap(map);
      })
      .catch(() => setAvailMap({}));
  }, [space.id, date, refreshKey]);

  // ✅ CLICK HANDLER
  const handleSeatClick = (unitId, slot) => {
    if (availMap[unitId]?.[slot]) return;

    if (!selectedUnit || selectedUnit !== unitId) {
      onSelect(unitId, [slot]);
      return;
    }

    const current = selectedSlots;

    if (current.length === 0) {
      onSelect(unitId, [slot]);
      return;
    }

    const allSlots = space.slots;

    const sortedSel = [...current].sort(
      (a, b) => slotToMinutes(a) - slotToMinutes(b)
    );

    const firstIdx = allSlots.indexOf(sortedSel[0]);
    const lastIdx = allSlots.indexOf(sortedSel[sortedSel.length - 1]);
    const thisIdx = allSlots.indexOf(slot);

    if (thisIdx === firstIdx - 1 || thisIdx === lastIdx + 1) {
      onSelect(unitId, [...current, slot]);
    } else {
      onSelect(unitId, [slot]);
    }
  };

  // ✅ STATUS
  const getSeatStatus = (unitId, slot) => {
    const isSelected =
      selectedUnit === unitId && selectedSlots.includes(slot);

    if (isSelected) return "selected";

    const mapStatus = availMap[unitId]?.[slot] ?? "free";

    if (mapStatus !== "free") return mapStatus;
    const now = new Date();
    const slotTime = new Date(`${date}T${slot}:00`);

    if (date === getTodayString()) {
      const diffMinutes = (slotTime - now) / (1000 * 60);

      if (diffMinutes < (space.advanceMinutes || 0)) {
        return "past";
      }
    }

    if (isSlotTooSoon(date, slot, space.advanceMinutes)) return "past";

    return "free";
  };

  return (
    <div>
      <div className="sm-row sm-header">
        <div className="sm-row-label-empty"></div>
        {space.slots.map(slot => (
          <div key={slot} className="sm-slot-header">
            {formatTime(slot)}
          </div>
        ))}
      </div>
      {units.map(unit => (
        <div className="sm-row" key={unit.id}>
          <div className="sm-row-label-empty">
            <span className="sm-unit-icon">{unit.icon}</span>
            <span>{unit.label}</span>
          </div>

          <div className="sm-row">
            {space.slots.map(slot => {
              const st = getSeatStatus(unit.id, slot);

              return (

                <button
                  key={slot}
                  className={`sm-seat ${st}`}
                  disabled={st !== "free" && st !== "selected"}
                  onClick={() => handleSeatClick(unit.id, slot)}
                >
                  {st === "selected" ? "✓" : st === "booked" ? "✕" : ""}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}



// ── Main Booking component ────────────────────────────────────────
export default function Booking() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const preSelected = location.state?.spaceType || "workspace";

  const [step, setStep] = useState(0);
  const [spaceId, setSpaceId] = useState(preSelected);
  const [date, setDate] = useState(getTodayString());
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [guests, setGuests] = useState(1);
  const [addons, setAddons] = useState({});
  const [saving, setSaving] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login", { state: { from: "/booking" }, replace: true });
  }, [user]);

  useEffect(() => {
    setSelectedUnit("");
    setSelectedSlots([]);
  }, [spaceId, date]);

  const space = SPACES.find(s => s.id === spaceId);

  const toggleAddon = (id, price) =>
    setAddons(prev => {
      const n = { ...prev };
      if (n[id]) delete n[id]; else n[id] = { qty: 1, price };
      return n;
    });

  const changeQty = (id, delta) =>
    setAddons(prev => {
      const n = { ...prev };
      if (!n[id]) return n;
      const q = n[id].qty + delta;
      if (q <= 0) delete n[id]; else n[id] = { ...n[id], qty: q };
      return n;
    });

  // Price calculation
  const hoursPerSlot = space.durationHoursPerSlot || 1;
  const totalHours = selectedSlots.length * hoursPerSlot || hoursPerSlot;
  const foodTotal = Object.values(addons).reduce((s, { qty, price }) => s + qty * price, 0);
  const spacePrice = space.price === 0 ? 0 : space.price * totalHours;
  const grandTotal = spacePrice + foodTotal;

  const menuByCategory = MENU_ITEMS.reduce((acc, item) => {
    if (!acc[item.cat]) acc[item.cat] = [];
    acc[item.cat].push(item);
    return acc;
  }, {});

  const unitLabel = UNITS_FOR_TYPE[spaceId]?.find(u => u.id === selectedUnit)?.label || "";
  const unitIcon = UNITS_FOR_TYPE[spaceId]?.find(u => u.id === selectedUnit)?.icon || space.icon;

  const sortedSlots = [...selectedSlots].sort((a, b) => slotToMinutes(a) - slotToMinutes(b));
  const firstSlot = sortedSlots[0] || "";

  const canGoToSeat = date >= getTodayString();
  const canGoToFood = !!selectedUnit && selectedSlots.length > 0;
  const canGoToReview = canGoToFood;

  const durationLabel = selectedSlots.length > 0
    ? `${totalHours} hour${totalHours > 1 ? "s" : ""}`
    : `${hoursPerSlot} hour`;

  const handleSeatSelect = useCallback((unitId, slots) => {
    setSelectedUnit(slots && slots.length > 0 ? unitId : "");
    setSelectedSlots(slots || []);
    setBookingError("");
  }, []);

  const handleConfirm = () => {
    console.log("CLICKED");
    console.log("selectedUnit:", selectedUnit);
    console.log("selectedSlots:", selectedSlots);
    console.log("BUTTON CLICKED");

    if (!selectedUnit || selectedSlots.length === 0) {
      alert("Select slot first");
      return;
    }

    const start = parseInt(selectedSlots[0].split(":")[0]);
    const last = selectedSlots[selectedSlots.length - 1];

    const duration = space.durationHoursPerSlot || 1;
    const end = parseInt(last.split(":")[0]) + duration;

    console.log("FETCH START");

    console.log("SENDING:", {
      unit_id: selectedUnit,
      space: space.label,
      date
    });


    fetch("http://localhost:5000/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: user?.email,   // ✅ IMPORTANT (email fix)
        space: space.label,
        date: date,
        start_time: start,
        end_time: end,
        price_per_hour: space.price,
        food_total: foodTotal,
        space_amount: spacePrice,
        unit_id: selectedUnit
      })
    })
      .then(async res => {
        const data = await res.json();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", data);

        if (!res.ok) {
          alert(data.error || "Booking failed");
          return;
        }

        alert("Booking Successful ₹" + data.total_amount);

        setSelectedSlots([]);
        setSelectedUnit("");
        navigate("/my-bookings");
      })
      .catch(err => {
        console.error("FETCH ERROR:", err);
        alert("Booking failed (network)");
      });
  };

  return (
    <div className="bk-page">
      {/* Header */}
      <header className="bk-header">
        <button className="bk-back-btn" onClick={() => navigate("/")}>← Seven Beans</button>
        <div className="bk-header-title">Reserve a Space</div>
        <button onClick={() => navigate("/my-bookings")}>
          My Bookings
        </button>
        <div className="bk-user-pill">
          {user?.photoURL
            ? <img src={user.photoURL} className="bk-avatar-img" alt="avatar" />
            : <div className="bk-avatar-init">{(user?.email || "?")[0].toUpperCase()}</div>}
          <span>{user?.displayName || user?.email?.split("@")[0]}</span>
        </div>
      </header>

      {/* Stepper */}
      <div className="bk-stepper">
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
            <div className={`bk-step ${i === step ? "active" : i < step ? "done" : ""}`}>
              <div className="bk-step-num">{i < step ? "✓" : i + 1}</div>
              <div className="bk-step-label">{label}</div>
            </div>
            {i < STEPS.length - 1 && <div className="bk-step-line" />}
          </div>
        ))}
      </div>

      <div className="bk-body">

        {/* ── STEP 0: Space & Date ── */}
        {step === 0 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">Choose Your Space & Date</h2>

            {/* Space selector — 3 main cards + cafe option */}
            <div className="bk-space-grid-main">
              {SPACES.filter(s => s.id !== "cafe").map(s => (
                <button
                  key={s.id}
                  className={`bk-space-card-main ${spaceId === s.id ? "selected" : ""}`}
                  onClick={() => setSpaceId(s.id)}
                >
                  <div className="bk-space-card-icon">{s.icon}</div>
                  <div className="bk-space-card-body">
                    <div className="bk-space-card-name">{s.label}</div>
                    <div className="bk-space-card-desc">{s.desc}</div>
                    <div className="bk-space-card-meta">
                      <span className="bk-space-card-price">
                        {s.price === 0 ? "Free" : `₹${s.price.toLocaleString("en-IN")}`}
                        <span className="bk-space-card-unit"> / {s.priceUnit}</span>
                      </span>
                      <span className="bk-space-card-advance">
                        Book {s.advanceMinutes}+ min ahead
                      </span>
                    </div>
                  </div>
                  {spaceId === s.id && <div className="bk-space-check">✓</div>}
                </button>
              ))}
            </div>

            {/* Cafe as a slim option */}
            <button
              className={`bk-space-cafe-row ${spaceId === "cafe" ? "selected" : ""}`}
              onClick={() => setSpaceId("cafe")}
            >
              <span className="bk-cafe-icon">☕</span>
              <span className="bk-cafe-label">Just Coffee — walk in, no booking required. Free.</span>
              {spaceId === "cafe" && <span className="bk-cafe-check">✓</span>}
            </button>

            {/* Date + Guests */}
            <div className="bk-time-grid">
              <div className="bk-field-group">
                <label className="bk-label">Date</label>
                <input
                  type="date"
                  className="bk-input"
                  value={date}
                  min={getTodayString()}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="bk-field-group">
                <label className="bk-label">Number of Guests</label>
                <div className="bk-stepper-inline">
                  <button onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
                  <span>{guests} {guests === 1 ? "guest" : "guests"}</span>
                  <button onClick={() => setGuests(g => Math.min(space.maxGuests, g + 1))}>+</button>
                </div>
                <div className="bk-capacity-note">Max {space.maxGuests} for this space</div>
              </div>
            </div>

            <div className="bk-policy-note">
              <strong>Cancellation Policy:</strong> Food orders are non-refundable. Space bookings: 30% non-refundable, 70% refunded on cancellation.
            </div>

            <button className="bk-next-btn" disabled={!canGoToSeat} onClick={() => setStep(1)}>
              Next: Pick Your Seat →
            </button>
          </div>
        )}

        {/* ── STEP 1: Seat Map ── */}
        {step === 1 && (
          <div className="bk-section fade-in">
            <div className="bk-seat-header">
              <div>
                <h2 className="bk-section-title">Pick Your Seat</h2>
                <p className="bk-seat-sub">
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{space.label}
                </p>
              </div>
              <button className="bk-skip-btn" onClick={() => setStep(0)}>← Back</button>
            </div>

            {bookingError && <div className="bk-error-bar">{bookingError}</div>}

            <SeatMap
              space={space}
              date={date}
              selectedUnit={selectedUnit}
              selectedSlots={selectedSlots}
              onSelect={handleSeatSelect}
              refreshKey={refreshKey}
            />
            {

              selectedUnit && selectedSlots.length > 0 && (() => {
                const unit = UNITS_FOR_TYPE[spaceId]?.find(u => u.id === selectedUnit);
                const sorted = [...selectedSlots].sort((a, b) => slotToMinutes(a) - slotToMinutes(b));
                return (
                  <div className="sm-selection-bar">
                    <div className="sm-selection-info">
                      <span className="sm-selection-icon">{unit?.icon}</span>
                      <div>
                        <div className="sm-selection-title">
                          {unit?.label} · {sorted[0] ? formatTime(sorted[0]) : ""}{sorted.length > 1 ? ` — ${sorted.length > 1 ? formatTime(sorted[sorted.length - 1]) : ""}` : ""}
                        </div>
                        <div className="sm-selection-sub">
                          {sorted.length} slot{sorted.length > 1 ? "s" : ""} selected
                          {" · "}{totalHours} hour{totalHours > 1 ? "s" : ""} total
                          {space.multiSlot && " · Click adjacent slots to extend"}
                        </div>
                      </div>
                    </div>
                    <div className="sm-selection-price">
                      {space.price === 0 ? "Free" : `₹${(((space.price * totalHours))).toLocaleString("en-IN")}`}
                    </div>
                  </div>
                );
              })()
            }

            <div className="bk-step-nav" style={{ marginTop: 24 }}>
              <button className="bk-prev-btn" onClick={() => setStep(0)}>← Back</button>
              <button className="bk-next-btn" style={{ marginTop: 0 }}
                disabled={!canGoToFood} onClick={() => setStep(2)}>
                Next: Pre-order Food →
              </button>
            </div>
          </div>
        )}


        {/* ── STEP 2: Food ── */}
        {step === 2 && (
          <div className="bk-section fade-in">
            <div className="bk-food-header">
              <div>
                <h2 className="bk-section-title">Pre-order Food</h2>
                <p className="bk-food-sub">Have your food ready the moment you arrive. Optional — but note food orders are non-refundable.</p>
              </div>
              <button className="bk-skip-btn" onClick={() => setStep(3)}>Skip →</button>
            </div>

            {Object.entries(menuByCategory).map(([cat, items]) => (
              <div key={cat} className="bk-menu-cat">
                <div className="bk-cat-label">{cat}</div>
                <div className="bk-menu-list">
                  {items.map(item => {
                    const inCart = addons[item.id];
                    return (
                      <div key={item.id} className={`bk-menu-item ${inCart ? "selected" : ""}`}>
                        <div className="bk-menu-info">
                          <div className="bk-menu-name">{item.name}</div>
                          <div className="bk-menu-desc">{item.desc}</div>
                          <div className="bk-menu-price">₹{item.price}</div>
                        </div>
                        <div className="bk-menu-action">
                          {!inCart
                            ? <button className="bk-add-btn" onClick={() => toggleAddon(item.id, item.price)}>+ Add</button>
                            : <div className="bk-qty-control">
                              <button onClick={() => changeQty(item.id, -1)}>−</button>
                              <span>{inCart.qty}</span>
                              <button onClick={() => changeQty(item.id, 1)}>+</button>
                            </div>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {Object.keys(addons).length > 0 && (
              <div className="bk-cart-bar">
                <div className="bk-cart-count">{Object.values(addons).reduce((s, v) => s + v.qty, 0)} item(s)</div>
                <div className="bk-cart-total">Food subtotal: ₹{foodTotal.toLocaleString("en-IN")}</div>
                <div className="bk-cart-note">Non-refundable</div>
              </div>
            )}

            <div className="bk-step-nav">
              <button className="bk-prev-btn" onClick={() => setStep(1)}>← Back</button>
              <button className="bk-next-btn" onClick={() => setStep(3)}>Review Booking →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="bk-section fade-in">
            <h2 className="bk-section-title">Review Your Booking</h2>

            {bookingError && <div className="bk-error-bar">{bookingError}</div>}

            <div className="bk-review-card">
              {[
                ["Space", `${space.icon} ${space.label}`],
                ["Seat", `${unitIcon} ${unitLabel}`],
                ["Date", new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
                ["Arrival", firstSlot ? formatTime(firstSlot) : "—"],
                ["Duration", durationLabel],
                ["Slots", sortedSlots.length > 1 ? sortedSlots.map(formatTime).join(", ") : formatTime(firstSlot)],
                ["Guests", `${guests} ${guests === 1 ? "guest" : "guests"}`],
              ].map(([label, val]) => (
                <div className="bk-review-row" key={label}>
                  <div className="bk-review-label">{label}</div>
                  <div className="bk-review-val">{val}</div>
                </div>
              ))}
            </div>

            {Object.keys(addons).length > 0 && (
              <div className="bk-review-food">
                <div className="bk-review-food-title">Pre-ordered Food <span className="bk-nonrefund-tag">Non-refundable</span></div>
                {Object.entries(addons).map(([id, { qty, price }]) => {
                  const item = MENU_ITEMS.find(m => m.id === id);
                  return (
                    <div className="bk-review-food-row" key={id}>
                      <span>{item.name} × {qty}</span>
                      <span>₹{(qty * price).toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bk-total-box">
              {space.price > 0 && (
                <div className="bk-total-row">
                  <span>Space charge</span>
                  <span>₹{spacePrice.toLocaleString("en-IN")}</span>
                </div>
              )}
              {foodTotal > 0 && (
                <div className="bk-total-row">
                  <span>Food pre-order</span>
                  <span>₹{foodTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="bk-total-row grand">
                <span>Total</span>
                <span>{grandTotal === 0 ? "Free" : `₹${grandTotal.toLocaleString("en-IN")}`}</span>
              </div>
              <div className="bk-tax-note">* Prices exclusive of taxes · Preparation time 15 min</div>
            </div>

            <div className="bk-policy-box">
              <div className="bk-policy-title">Cancellation Policy</div>
              {foodTotal > 0 && (
                <div className="bk-policy-item">🍽️ Food pre-order (₹{foodTotal.toLocaleString("en-IN")}): <strong>Non-refundable</strong></div>
              )}
              {spacePrice > 0 && (
                <>
                  <div className="bk-policy-item">🏠 Space charge: <strong>30% non-refundable</strong> (₹{Math.round(spacePrice * 0.3).toLocaleString("en-IN")})</div>
                  <div className="bk-policy-item">✅ Refund on cancellation: <strong>₹{Math.round(spacePrice * 0.7).toLocaleString("en-IN")}</strong> (70% of space charge)</div>
                </>
              )}
            </div>

            <div className="bk-step-nav">
              <button className="bk-prev-btn" onClick={() => setStep(2)}>← Back</button>

              <button
                onClick={handleConfirm}
                disabled={!selectedUnit || selectedSlots.length === 0}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
// Save me!
