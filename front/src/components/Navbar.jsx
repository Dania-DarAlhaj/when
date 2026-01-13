import React from "react";
import { useNavigate } from "react-router-dom";
import './Navbar.css';

export default function Navbar({ userId }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button onClick={() => navigate("/profile", { state: { userId } })}>Profile</button>
        <button onClick={() => navigate("/visit-form", { state: { userId } })}>Visit Form</button>
        <button onClick={() => navigate("/search")}>Search</button>
        <button onClick={() => navigate("/add-booking", { state: { userId } })}>Add Booking</button>
        <button onClick={() => navigate("/booking-details", { state: { userId } })}>See Booking Details</button>
      </div>
      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
