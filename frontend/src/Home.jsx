import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Authcontext";
import { getReviews } from "./Bookingstore";
import "./App.css";

// Seed reviews shown when no real ones exist yet
const SEED_REVIEWS = [
  {
    id: "seed1", userName: "Arjun K.", userInit: "AK", spaceLabel: "Focus Workspace", stars: 5,
    text: "I come here every morning to work. The pods are incredibly peaceful and the coffee is genuinely the best I've had in Coimbatore.", createdAt: "2026-04-01T09:00:00Z"
  },
  {
    id: "seed2", userName: "Priya R.", userInit: "PR", spaceLabel: "Birthday Hall", stars: 5,
    text: "Celebrated my 25th here — the team decorated everything perfectly. Our guests were absolutely blown away by the ambience.", createdAt: "2026-03-20T14:00:00Z"
  },
  {
    id: "seed3", userName: "Santhosh M.", userInit: "SM", spaceLabel: "Conference Room", stars: 5,
    text: "Hosted our quarterly review here. AV worked flawlessly, lunch was on time, and the team was incredibly professional.", createdAt: "2026-03-10T11:00:00Z"
  },
];

function StarRow({ count }) {
  return (
    <span className="star-row">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? "star filled" : "star"}>★</span>
      ))}
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("workspace");
  const [activeMenuCat, setActiveMenuCat] = useState("Bites");
  const [liveReviews, setLiveReviews] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const real = getReviews();
    setLiveReviews(real.length > 0 ? real : SEED_REVIEWS);
  }, []);

  const tabs = [
    { id: "workspace", icon: "💼", label: "Workspace" },
    { id: "birthday", icon: "🎂", label: "Birthday Hall" },
    { id: "conference", icon: "🤝", label: "Conference Room" },
    { id: "cafe", icon: "☕", label: "Just Coffee" },
  ];

  const spaces = [
    {
      id: "workspace",
      image: "/workspace.jpeg",
      title: "Focus Workspace",
      subtitle: "12 private pods available",
      desc: "Escape the noise. Each pod comes with ergonomic seating, 300 Mbps dedicated fibre, dual monitor mounts, USB-C charging, and a complimentary barista coffee to kick off your session.",
      tags: ["300 Mbps WiFi", "Quiet Zone", "Power & USB-C", "Barista Coffee", "12 Pods"],
      price: "₹149", unit: "/hr", rating: 4.9, reviews: 312, featured: true,
      perks: ["From 8 AM to 9 PM", "Min 1 hr · Max full day", "Up to 4 guests per pod"],
    },
    {
      id: "birthday",
      image: "/birthday.jpg",
      title: "Birthday Hall",
      subtitle: "2 exclusive event halls",
      desc: "Make every moment count. Both halls feature custom décor packages, a dedicated party host, a cake station, balloon arches, and a Bluetooth sound system — everything handled for you.",
      tags: ["Custom Décor", "Dedicated Host", "Cake Station", "Sound System", "Up to 40 pax"],
      price: "₹2,499", unit: "/event", rating: 4.8, reviews: 186, featured: false,
      perks: ["Available 10 AM – 10 PM", "2–4 hr slots", "Décor setup included"],
    },
    {
      id: "conference",
      image: "/meeting.jpg",
      title: "Conference Room",
      subtitle: "2 professional meeting rooms",
      desc: "Run meetings that actually matter. Both rooms are equipped with 4K projectors, interactive whiteboards, video-conferencing cameras, catered coffee breaks, and noise-isolating walls.",
      tags: ["4K Projector", "Interactive Whiteboard", "Video Conferencing", "Up to 20 pax"],
      price: "₹799", unit: "/hr", rating: 4.7, reviews: 94, featured: false,
      perks: ["Available 8 AM – 8 PM", "Min 1 hr booking", "Coffee breaks included"],
    },
    {
      id: "conference",
      image: "/meeting.jpg",
      title: "Conference Room",
      subtitle: "2 professional meeting rooms",
      desc: "Run meetings that actually matter. Both rooms are equipped with 4K projectors, interactive whiteboards, video-conferencing cameras, catered coffee breaks, and noise-isolating walls.",
      tags: ["4K Projector", "Interactive Whiteboard", "Video Conferencing", "Up to 20 pax"],
      price: "₹799", unit: "/hr", rating: 4.7, reviews: 94, featured: false,
      perks: ["Available 8 AM – 8 PM", "Min 1 hr booking", "Coffee breaks included"],
    },

  ];

  const menuCategories = ["Bites", "Toasties", "Pizzas", "Pasta", "Maggie", "Health", "Drinks"];
  const menuItems = {
    Bites: [
      { name: "Chip an Dip", desc: "Potato chips served with tzatziki", price: 150 },
      { name: "Nachos", desc: "Crispy nachos with salsa and cheese", price: 200 },
      { name: "Spring Rolls", desc: "Golden fried vegetable spring rolls with sweet chilli", price: 150 },
      { name: "Woodfired Garlic Bread", desc: "Rustic garlic bread baked in the oven", price: 150 },
      { name: "Crunchy Nuggets", desc: "Crumb-coated vegetarian nuggets with mayo", price: 150 },
      { name: "French Fries", desc: "Classic with peri-peri / sriracha chilli sauce", price: 150 },
      { name: "Butter Garlic Potato", desc: "Potatoes tossed in butter and garlic", price: 150 },
      { name: "Grilled Corn Ribs", desc: "Oven grilled corn with chilli garlic and lime", price: 180 },
    ],
    Toasties: [
      { name: "Cheese Chilli Toast", desc: "Cheese, chilli, chopped capsicum topped", price: 180 },
      { name: "Avocado Toast", desc: "Avocado mash with homemade vegetable spread", price: 225 },
      { name: "Veg Grill Sandwich", desc: "Capsicum, tomato, cabbage grilled with mayo sauce", price: 180 },
      { name: "Corn & Cheese Sandwich", desc: "Creamy mix of sweet corn and melted cheese", price: 180 },
      { name: "Paneer Tikka Sandwich", desc: "Paneer filling with onions, tomato & mint chutney", price: 200 },
    ],
    Pizzas: [
      { name: "Margherita", desc: "Tomato sauce and mozzarella cheese", price: 325 },
      { name: "Corn and Cheese", desc: "Corn, cheese and mozzarella cheese", price: 350 },
      { name: "Fully Loaded", desc: "Schezwan sauce, paneer, corn, capsicum, onion & mozzarella", price: 395 },
      { name: "Tandoori Paneer", desc: "Tandoori paneer, onion, capsicum, mayo & mozzarella", price: 395 },
      { name: "Italian Pesto Veggie Blast", desc: "Sundried tomato, broccoli, olives & burrata", price: 425 },
      { name: "Mushroom Delight", desc: "White sauce, button mushrooms, black olives & jalapeños", price: 395 },
    ],
    Pasta: [
      { name: "Arrabiata", desc: "Garlic, capsicum, babycorn in spicy tomato sauce", price: 250 },
      { name: "Alfredo", desc: "Corn, capsicum, broccoli over creamy white sauce", price: 250 },
      { name: "Pesto", desc: "Pasta with classic basil pesto sauce", price: 250 },
    ],
    Maggie: [
      { name: "Maggie Exotica", desc: "Spiced maggi noodles with assorted vegetables", price: 170 },
      { name: "Paneer & Corn Maggi", desc: "Noodles with paneer and sweet corn", price: 190 },
    ],
    Health: [
      { name: "Sautéed Veggies", desc: "Seasonal vegetables lightly seasoned in olive oil", price: 225 },
      { name: "Baked Broccoli", desc: "Broccoli baked with herb cheese and seasoning", price: 225 },
      { name: "Granola Bowl", desc: "Crunchy granola with yogurt and fresh fruits", price: 250 },
      { name: "Green Salad", desc: "A mix of fresh garden greens", price: 180 },
      { name: "Caesar Salad", desc: "Classic with lettuce, parmesan and croutons", price: 225 },
      { name: "Greek Salad", desc: "Cucumbers, olives, cherry tomato and feta", price: 225 },
      { name: "Watermelon, Orange, Feta", desc: "Refreshing fruit salad with feta cheese", price: 225 },
    ],
    Drinks: [
      { name: "Filter Coffee", desc: "South Indian drip coffee, hot & strong", price: 80 },
      { name: "Cold Brew", desc: "12-hour steeped cold brew, smooth and bold", price: 160 },
      { name: "Flat White", desc: "Ristretto shots with velvety steamed milk", price: 140 },
      { name: "Matcha Latte", desc: "Premium ceremonial matcha with oat milk", price: 175 },
      { name: "Watermelon Cooler", desc: "Fresh watermelon, lime and mint — chilled", price: 150 },
      { name: "Mango Lassi", desc: "Thick Alphonso mango blended with yogurt", price: 140 },
      { name: "Strawberry Smoothie", desc: "Fresh strawberries, banana and milk", price: 160 },
      { name: "Virgin Mojito", desc: "Lime, mint, sugar and sparkling water", price: 130 },
    ],
  };

  const handleBooking = (spaceType) => {
    if (user) navigate("/booking", { state: { spaceType } });
    else navigate("/login", { state: { from: "/booking", spaceType } });
  };

  const avgRating = liveReviews.length
    ? (liveReviews.reduce((s, r) => s + r.stars, 0) / liveReviews.length).toFixed(1)
    : "5.0";

  return (
    <>
      {/* ── NAVBAR ── */}
      <header className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-mark">7B</div>
          <span className="nav-logo-text">Seven<span>Beans</span></span>
        </div>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#spaces" onClick={() => setMenuOpen(false)}>Spaces</a>
          <a href="#menu" onClick={() => setMenuOpen(false)}>Menu</a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>

        <div className="nav-auth">
          {user ? (
            <>
              <button className="nav-login" onClick={() => navigate("/dashboard")}>My Bookings</button>
              <button className="nav-signup" onClick={logout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">Log In</Link>
              <Link to="/signup" className="nav-signup">Sign Up</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </header>

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-top">
          <div className="hero-eyebrow">✦ Est. 2010 · Hubli</div>
          <h1>Book Your Perfect<br /><em>Café Experience</em></h1>
          <p className="hero-sub">Workspace · Events · Meetings · Just Coffee</p>
        </div>

        <div className="booking-widget" id="spaces">
          <div className="booking-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`booking-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <div className="booking-form">
            <div className="booking-fields">
              <div className="bfield">
                <label>Space Type</label>
                <select value={activeTab} onChange={e => setActiveTab(e.target.value)}>
                  <option value="workspace">Focus Workspace</option>
                  <option value="birthday">Birthday Hall</option>
                  <option value="conference">Conference Room</option>
                  <option value="cafe">Just Coffee</option>
                </select>
              </div>
              <div className="bfield">
                <label>Date</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="bfield">
                <label>Number of Guests</label>
                <select>
                  <option>1 Guest</option><option>2 Guests</option>
                  <option>3–5 Guests</option><option>6–10 Guests</option>
                  <option>10–20 Guests</option><option>20+ Guests</option>
                </select>
              </div>
              <button className="search-btn" onClick={() => handleBooking(activeTab)}>
                🔍 Search Spaces
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {["12 Work Pods", "2 Birthday Halls", "2 Conference Rooms", "300 Mbps WiFi",
            "100% Vegetarian", "Artisan Coffee", "Instant Booking", "Pre-order Food",
            "12 Work Pods", "2 Birthday Halls", "2 Conference Rooms", "300 Mbps WiFi",
            "100% Vegetarian", "Artisan Coffee", "Instant Booking", "Pre-order Food",
          ].map((item, i) => (
            <span key={i}>{item} <span className="dot">•</span></span>
          ))}
        </div>
      </div>

      {/* ── SPACES GRID ── */}
      <section className="section bg-grey">
        <div className="section-head">
          <div>
            <div className="section-kicker">Our Spaces</div>
            <h2 className="section-title">Find Your Perfect Spot</h2>
          </div>
          <button className="view-all" onClick={() => handleBooking("workspace")}>Book a Space →</button>
        </div>

        <div className="space-grid">
          {spaces.map(s => (
            <div key={s.id} className={`space-card ${s.featured ? "featured" : ""}`}>
              {s.featured && <div className="featured-badge">Most Popular</div>}
              <div className="space-img">
                <img src={s.image} alt={s.title} />
                <div className="space-price-tag">{s.price}{s.unit}</div>
              </div>
              <div className="space-body">
                <div className="space-rating">
                  <span className="rating-star">★</span>
                  {s.rating}
                  <span className="rating-count">({s.reviews} reviews)</span>
                </div>
                <h3>{s.title}</h3>
                <div className="space-subtitle">{s.subtitle}</div>
                <p>{s.desc}</p>
                <div className="space-tags">
                  {s.tags.map(tag => <span className="space-tag" key={tag}>{tag}</span>)}
                </div>
                {s.perks && (
                  <ul className="space-perks">
                    {s.perks.map(p => <li key={p}>✓ {p}</li>)}
                  </ul>
                )}
                <div className="space-cta">
                  <div className="space-price">{s.price}<span>{s.unit}</span></div>
                  <button className="book-btn" onClick={() => handleBooking(s.id)}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-row">
          {[["12", "Work Pods"], ["2", "Birthday Halls"], ["2", "Conference Rooms"], ["18+", "Coffee Blends"], ["2,400+", "Happy Guests"], ["4.8★", "Avg Rating"]].map(([n, l]) => (
            <div className="stat-cell" key={l}>
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAFÉ MENU ── */}
      <section className="section bg-white" id="menu">
        <div className="section-head">
          <div>
            <div className="section-kicker">Our Menu</div>
            <h2 className="section-title">Freshly Made, Every Day</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: 8, maxWidth: 480, lineHeight: 1.7 }}>
              From artisan coffee to hearty bites — everything on our menu is made fresh in-house.
              Pre-order with your booking and it'll be ready the moment you arrive.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span className="menu-note">🌱 100% Vegetarian Menu</span>
            <span className="menu-note">Pre-order food when booking your space</span>
          </div>
        </div>

        <div className="menu-cat-tabs">
          {menuCategories.map(cat => (
            <button
              key={cat}
              className={`menu-cat-tab ${activeMenuCat === cat ? "active" : ""}`}
              onClick={() => setActiveMenuCat(cat)}
            >{cat}</button>
          ))}
        </div>

        <div className="menu-items-grid">
          {(menuItems[activeMenuCat] || []).map(item => (
            <div className="menu-item-card" key={item.name}>
              <div className="menu-item-veg">🟢</div>
              <div className="menu-item-body">
                <div className="menu-item-name">{item.name}</div>
                <div className="menu-item-desc">{item.desc}</div>
              </div>
              <div className="menu-item-footer">
                <div className="menu-item-price">₹{item.price}</div>
                <button className="menu-item-order" onClick={() => handleBooking("workspace")}>Pre-order</button>
              </div>
            </div>
          ))}
        </div>

        <p className="menu-disclaimer">* Prices exclusive of taxes · Preparation time 15 minutes</p>

        <div className="menu-cta-row">
          <p>Want to order ahead? Pre-order food when booking your space.</p>
          <button className="book-btn" onClick={() => handleBooking("workspace")}>Book & Pre-order →</button>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section bg-blue" id="about">
        <div className="section-head">
          <div>
            <div className="section-kicker light">Why Seven Beans</div>
            <h2 className="section-title light">More Than a Café</h2>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", maxWidth: 360 }}>
            Everything we do is designed to make your time here effortless, comfortable and memorable.
          </p>
        </div>
        <div className="why-grid">
          {[
            { icon: "⚡", title: "Instant Booking", desc: "Confirm your space in under 60 seconds. No phone calls, no waiting lists, no back-and-forth." },
            { icon: "☕", title: "Barista on Tap", desc: "Premium single-origin coffee, cold brews, and seasonal specials included with every workspace booking." },
            { icon: "📶", title: "300 Mbps Gigabit WiFi", desc: "Dedicated fibre — never throttled, never shared with a hundred strangers. Your connection, your speed." },
            { icon: "🍽️", title: "Pre-order Food", desc: "Order from our full café menu when you book. Your meal is hot, fresh, and ready the moment you walk in." },
            { icon: "🔒", title: "Private & Secure", desc: "Sound-isolated pods and rooms. What happens in your meeting, pitch, or focus session stays there." },
            { icon: "🎉", title: "Event-Ready Spaces", desc: "From birthday bashes to board meetings — fully equipped halls with décor, AV, and a dedicated host." },
          ].map(w => (
            <div className="why-card" key={w.title}>
              <div className="why-icon">{w.icon}</div>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section className="section bg-white" id="reviews">
        <div className="section-head">
          <div>
            <div className="section-kicker">Guest Reviews</div>
            <h2 className="section-title">Real Experiences, Real People</h2>
          </div>
          <div className="reviews-summary">
            <span className="reviews-avg-num">{avgRating}</span>
            <div>
              <div className="reviews-avg-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(Number(avgRating)) ? "star filled" : "star"}>★</span>
                ))}
              </div>
              <div className="reviews-avg-count">{liveReviews.length} review{liveReviews.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </div>

        <div className="review-grid">
          {liveReviews.slice(0, 6).map(r => (
            <div className="review-card" key={r.id}>
              <div className="review-header">
                <div className="reviewer-avatar">{r.userInit || (r.userName || "?")[0].toUpperCase()}</div>
                <div>
                  <div className="reviewer-name">{r.userName}</div>
                  <div className="reviewer-tag">{r.spaceLabel}</div>
                </div>
                <div className="review-date">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < r.stars ? "#f5a623" : "#dde2f0" }}>★</span>
                ))}
              </div>
              <p className="review-text">"{r.text}"</p>
            </div>
          ))}
        </div>

        {/* CTA to leave a review */}
        <div className="review-cta-row">
          <div>
            <div className="review-cta-title">Visited Seven Beans? Share your experience.</div>
            <div className="review-cta-sub">Book a space and leave a review from your dashboard.</div>
          </div>
          <button className="book-btn" onClick={() => user ? navigate("/dashboard") : navigate("/login")}>
            {user ? "Go to My Bookings →" : "Sign In to Review →"}
          </button>
        </div>
      </section>

      {/* ── RESERVE NOW — 3 Cards ── */}
      <section className="section bg-grey reserve-section" id="contact">
        <div className="section-head">
          <div>
            <div className="section-kicker">Book Online</div>
            <h2 className="section-title">Reserve Your Space</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: 8, lineHeight: 1.7 }}>
              Select a space below to get started. Instant confirmation, no waiting.
            </p>
          </div>
        </div>
        <div className="reserve-cards">
          <div className="reserve-card">
            <div className="reserve-card-icon">💼</div>
            <div className="reserve-card-body">
              <h3>Focus Workspace</h3>
              <p>Private pods with 300 Mbps WiFi, ergonomic seating and complimentary coffee. Available from 8 AM.</p>
              <div className="reserve-card-meta">
                <span>₹149 / hour</span>
                <span>12 pods</span>
                <span>Up to 4 guests</span>
              </div>
            </div>
            <button className="reserve-card-btn" onClick={() => handleBooking("workspace")}>
              Reserve Workspace →
            </button>
          </div>
          <div className="reserve-card featured-reserve">
            <div className="reserve-card-badge">Most Popular</div>
            <div className="reserve-card-icon">🎂</div>
            <div className="reserve-card-body">
              <h3>Birthday Hall</h3>
              <p>Exclusive event halls with custom décor, dedicated host, cake station and Bluetooth sound system.</p>
              <div className="reserve-card-meta">
                <span>₹2,499 / event</span>
                <span>2 halls</span>
                <span>Up to 40 guests</span>
              </div>
            </div>
            <button className="reserve-card-btn" onClick={() => handleBooking("birthday")}>
              Reserve Birthday Hall →
            </button>
          </div>
          <div className="reserve-card">
            <div className="reserve-card-icon">🤝</div>
            <div className="reserve-card-body">
              <h3>Conference Room</h3>
              <p>Professional rooms with 4K projector, interactive whiteboard, video conferencing and catered breaks.</p>
              <div className="reserve-card-meta">
                <span>₹799 / hour</span>
                <span>2 rooms</span>
                <span>Up to 20 guests</span>
              </div>
            </div>
            <button className="reserve-card-btn" onClick={() => handleBooking("conference")}>
              Reserve Conference Room →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo-mark" style={{ background: "#fff", color: "#3e1f0a" }}>7B</div>
            <div className="footer-brand-name">Seven Beans Café</div>
            <p>Coimbatore's favourite workspace café. Premium coffee, flexible spaces, and a community that feels like family.</p>
          </div>
          <div className="footer-col">
            <h5>Spaces</h5>
            <a href="#spaces">Workspace</a>
            <a href="#spaces">Birthday Hall</a>
            <a href="#spaces">Conference Room</a>
            <a href="#spaces">Just Coffee</a>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <a href="#about">About Us</a>
            <a href="#menu">Menu</a>
            <a href="#reviews">Reviews</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <a href="#">📍 Coimbatore, Tamil Nadu</a>
            <a href="#">📞 +91 98765 43210</a>
            <a href="#">✉ hello@sevenbeans.in</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Seven Beans Café. All rights reserved.</p>
          <p>Privacy Policy · Terms of Use</p>
        </div>
      </footer>
    </>
  );
}