import React from "react";

function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        <img src="/cafe-logo.jpeg" alt="logo" />
        <span>Seven Beans</span>
      </div>

      <nav>
        <a href="#">Home</a>
        <a href="#">Spaces</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>

      <div className="auth">
        <a href="/login2.html">Login</a>
        <a href="/login2.html" className="signup">Sign Up</a>
      </div>
    </header>
  );
}

export default Navbar;