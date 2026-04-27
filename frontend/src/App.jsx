import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./login";
import Booking from "./Booking";
import Dashboard from "./Dashboard";
import MyBookings from "./MyBookings";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login defaultSignUp={true} />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-bookings" element={<MyBookings />} />
    </Routes>
  );
}

export default App;