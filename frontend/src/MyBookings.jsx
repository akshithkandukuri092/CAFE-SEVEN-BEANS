import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [data, setData] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/bookings")
      .then(res => res.json())
      .then(setData);
  }, []);

  // ✅ cancel function MUST be here (not inside JSX)
  const cancelBooking = (id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;

    fetch(`http://localhost:5000/booking/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Booking cancelled");

        // update UI
        setData(prev => prev.filter(b => b.id !== id));
      })
      .catch(() => alert("Cancel failed"));
  };

  // ✅ filter only current user bookings
  const filtered = data.filter(
    b => b.name === user?.email
  );

  return (
    <div>
      <h2>My Bookings</h2>

      {/* 🔥 Logout button */}
      <button
        onClick={() => {
          signOut(auth);
          navigate("/login");
        }}
      >
        Logout
      </button>

      {/* 🔥 Bookings list */}
      {filtered.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        filtered.map(b => (
          <div
            key={b.id}
            style={{ border: "1px solid gray", margin: 10, padding: 10 }}
          >
            <div><b>{b.space}</b></div>
            <div>Date: {b.date}</div>
            <div>Time: {b.start_time}:00 - {b.end_time}:00</div>
            <div>Amount: ₹{b.total_amount}</div>

            {/* 🔥 Cancel button */}
            <button onClick={() => cancelBooking(b.id)}>
              Cancel Booking
            </button>
          </div>
        ))
      )}
    </div>
  );
}
// Save me!