import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./Authcontext";
import { getBookings, cancelBooking, saveReview, hasReviewed, getReviews, getCancellationBreakdown } from "./Bookingstore";
import "./Dashboard.css";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Returns true if the booking can still be cancelled (>10 min before slot).
function canCancelBooking(booking) {
  if (booking.status !== "confirmed") return false;
  // Only restrict cancellation on today's bookings
  const today = new Date().toISOString().split("T")[0];
  if (booking.date !== today) return true; // future date, always cancelable
  if (!booking.slot) return true;
  const [h, m] = booking.slot.split(":").map(Number);
  const slotMs = new Date().setHours(h, m, 0, 0);
  const nowMs = Date.now();
  const cutoff = slotMs - 10 * 60 * 1000; // 10 min before
  return nowMs < cutoff;
}

const STATUS_META = {
  confirmed: { label: "Confirmed", color: "#16a34a", bg: "#dcfce7" },
  completed: { label: "Completed", color: "#6b3a1f", bg: "#f5ede4" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
};

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="db-star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`db-star-btn ${n <= (hovered || value) ? "filled" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          type="button"
        >★</button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [reviewModal, setReviewModal] = useState(null); // booking object
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const justBooked = location.state?.justBooked;

  useEffect(() => {
    if (!user) { navigate("/login", { replace: true }); return; }
    setBookings(getBookings(user.uid));
  }, [user]);

  const refresh = () => setBookings(getBookings(user.uid));

  const handleCancel = (booking) => {
    if (!canCancelBooking(booking)) {
      alert("Cancellations are not allowed within 10 minutes of your booking time.");
      return;
    }
    const breakdown = getCancellationBreakdown(booking);
    const lines = ["Cancellation Policy:\n"];
    if (breakdown.foodTotal > 0) {
      lines.push(`• Food pre-order (₹${breakdown.foodTotal.toLocaleString("en-IN")}): Non-refundable`);
    }
    if (breakdown.spacePrice > 0) {
      lines.push(`• Space charge: 30% non-refundable (₹${breakdown.spaceNonRefund.toLocaleString("en-IN")})`);
      lines.push(`• Refund: ₹${breakdown.refundAmount.toLocaleString("en-IN")} (70% of space charge)`);
    }
    lines.push(`\nProceed with cancellation?`);
    if (!window.confirm(lines.join("\n"))) return;
    cancelBooking(user.uid, booking.id);
    refresh();
  };

  const openReview = (booking) => {
    setReviewModal(booking);
    setStars(5);
    setReviewText("");
    setSubmitted(false);
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;
    setSubmitting(true);
    saveReview({
      bookingId: reviewModal.id,
      spaceId: reviewModal.spaceId,
      spaceLabel: reviewModal.spaceLabel,
      spaceIcon: reviewModal.spaceIcon,
      stars,
      text: reviewText.trim(),
      userName: user.displayName || user.email.split("@")[0],
      userEmail: user.email,
      userInit: (user.displayName || user.email)[0].toUpperCase(),
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setReviewModal(null), 1800);
  };

  const filtered = bookings.filter(b => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const totalSpent = bookings
    .filter(b => b.status !== "cancelled")
    .reduce((s, b) => s + (b.grandTotal || 0), 0);

  const spaceCount = [...new Set(bookings.filter(b => b.status !== "cancelled").map(b => b.spaceId))].length;

  return (
    <div className="db-page">
      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo" onClick={() => navigate("/")}>
          <div className="db-logo-mark">7B</div>
          <span className="db-logo-text">Seven<span>Beans</span></span>
        </div>

        <nav className="db-sidenav">
          <button className="db-sidenav-item active">
            <span className="db-nav-icon">📋</span> My Bookings
          </button>
          <button className="db-sidenav-item" onClick={() => navigate("/booking")}>
            <span className="db-nav-icon">➕</span> New Booking
          </button>
          <button className="db-sidenav-item" onClick={() => navigate("/")}>
            <span className="db-nav-icon">🏠</span> Home
          </button>
        </nav>

        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" />
              : <span>{(user?.email || "?")[0].toUpperCase()}</span>}
          </div>
          <div className="db-sidebar-info">
            <div className="db-sidebar-name">{user?.displayName || user?.email?.split("@")[0]}</div>
            <div className="db-sidebar-email">{user?.email}</div>
          </div>
          <button className="db-logout-btn" onClick={logout} title="Sign out">↪</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="db-main">
        {/* Welcome banner */}
        {justBooked && (
          <div className="db-success-banner">
            <span>🎉</span>
            <div>
              <strong>Booking confirmed!</strong>
              <span> Your space is reserved. See details below.</span>
            </div>
          </div>
        )}

        <div className="db-main-header">
          <div>
            <h1 className="db-page-title">My Bookings</h1>
            <p className="db-page-sub">Track, manage and review all your reservations</p>
          </div>
          <button className="db-new-btn" onClick={() => navigate("/booking")}>+ New Booking</button>
        </div>

        {/* Stats */}
        <div className="db-stats">
          <div className="db-stat-card">
            <div className="db-stat-icon">📋</div>
            <div className="db-stat-val">{bookings.length}</div>
            <div className="db-stat-label">Total Bookings</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">✅</div>
            <div className="db-stat-val">{bookings.filter(b => b.status === "confirmed").length}</div>
            <div className="db-stat-label">Upcoming</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-icon">🍽️</div>
            <div className="db-stat-val">{spaceCount}</div>
            <div className="db-stat-label">Spaces Visited</div>
          </div>
          <div className="db-stat-card highlight">
            <div className="db-stat-icon">💰</div>
            <div className="db-stat-val">₹{totalSpent.toLocaleString("en-IN")}</div>
            <div className="db-stat-label">Total Spent</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="db-filter-tabs">
          {["all", "confirmed", "completed", "cancelled"].map(tab => (
            <button
              key={tab}
              className={`db-filter-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="db-tab-count">
                {tab === "all" ? bookings.length : bookings.filter(b => b.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {filtered.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">☕</div>
            <h3>No bookings yet</h3>
            <p>Reserve a workspace, birthday hall, or conference room to get started.</p>
            <button className="db-new-btn" onClick={() => navigate("/booking")}>Make Your First Booking</button>
          </div>
        ) : (
          <div className="db-booking-list">
            {filtered.map(b => {
              const sm = STATUS_META[b.status] || STATUS_META.confirmed;
              const reviewed = hasReviewed(b.id);
              return (
                <div key={b.id} className={`db-booking-card ${b.status}`}>
                  <div className="db-booking-left">
                    <div className="db-booking-icon">{b.spaceIcon}</div>
                    <div className="db-booking-info">
                      <div className="db-booking-name">{b.spaceLabel}</div>
                      <div className="db-booking-meta">
                        <span>📅 {formatDate(b.date)}</span>
                        <span>🕐 {formatTime(b.slot)}</span>
                        <span>⏱ {b.duration}</span>
                        <span>👥 {b.guests} {b.guests === 1 ? "guest" : "guests"}</span>
                      </div>
                      {b.foodItems && b.foodItems.length > 0 && (
                        <div className="db-booking-food">
                          🍽️ {b.foodItems.map(f => `${f.name} ×${f.qty}`).join(", ")}
                        </div>
                      )}
                      <div className="db-booking-id">#{b.id} · {timeAgo(b.createdAt)}</div>
                    </div>
                  </div>

                  <div className="db-booking-right">
                    <div className="db-booking-total">
                      {b.grandTotal === 0 ? "Free" : `₹${b.grandTotal.toLocaleString("en-IN")}`}
                    </div>
                    <div className="db-status-badge" style={{ color: sm.color, background: sm.bg }}>
                      {sm.label}
                    </div>
                    <div className="db-booking-actions">
                      {b.status === "confirmed" && canCancelBooking(b) && (
                        <button className="db-cancel-btn" onClick={() => handleCancel(b)}>Cancel</button>
                      )}
                      {b.status === "confirmed" && !canCancelBooking(b) && (
                        <span style={{ fontSize: "0.73rem", color: "#8b93b0", padding: "5px 10px" }}>
                          🔒 Cancel locked
                        </span>
                      )}
                      {!reviewed ? (
                        <button className="db-review-btn" onClick={() => openReview(b)}>
                          ✍️ Review
                        </button>
                      ) : (
                        <span className="db-reviewed-tag">✓ Reviewed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="db-modal-backdrop" onClick={() => setReviewModal(null)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            {!submitted ? (
              <>
                <div className="db-modal-header">
                  <div className="db-modal-icon">{reviewModal.spaceIcon}</div>
                  <div>
                    <h3>Rate Your Visit</h3>
                    <p>{reviewModal.spaceLabel} · {formatDate(reviewModal.date)}</p>
                  </div>
                  <button className="db-modal-close" onClick={() => setReviewModal(null)}>✕</button>
                </div>

                <div className="db-modal-stars-label">Your rating</div>
                <StarPicker value={stars} onChange={setStars} />

                <div className="db-modal-field">
                  <label>Tell us about your experience</label>
                  <textarea
                    className="db-review-textarea"
                    rows={4}
                    placeholder="What did you love? Anything we can improve?"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />
                </div>

                <div className="db-modal-actions">
                  <button className="db-modal-cancel-btn" onClick={() => setReviewModal(null)}>Cancel</button>
                  <button
                    className="db-modal-submit-btn"
                    onClick={submitReview}
                    disabled={submitting || !reviewText.trim()}
                  >
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </>
            ) : (
              <div className="db-modal-thanks">
                <div className="db-thanks-icon">🎉</div>
                <h3>Thank you!</h3>
                <p>Your review has been posted and will help other guests.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}