import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient"; 

import { useNavigate } from "react-router-dom";
import "../style/UserPage.css";
export default function UserPage() {
  const location = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
const email = sessionStorage.getItem("pendingEmail");
const password = sessionStorage.getItem("pendingPassword");

  const cities = ["Ramallah", "Hebron", "Nablus", "Tulkarm", "Jericho"];
const navigate = useNavigate();
  // helper: hash password with random salt using Web Crypto (SHA-256)
  async function hashPassword(plain) {
    const enc = new TextEncoder();
    const pwBuffer = enc.encode(plain);
    const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
    // combine salt + password
    const combined = new Uint8Array(saltArray.length + pwBuffer.length);
    combined.set(saltArray);
    combined.set(pwBuffer, saltArray.length);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined.buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return { salt: saltHex, hash: hashHex };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // prefer freshly entered password if available, otherwise use pendingPassword
    const plainPassword = password || '';
    if (!plainPassword) {
      alert('No password available to store.');
      return;
    }

    setTimeout(()=>{},0);

    // hash the password before saving
    let salted;
    try {
      salted = await hashPassword(plainPassword);
    } catch (err) {
      console.error('Hashing error', err);
      alert('Failed to process password.');
      return;
    }

    const userData = {
      email,
      password_hash: salted.hash,
      password_salt: salted.salt,
      role: "user",
      name,
      phone,
      city,
      verified: false,
    };

    const { data, error } = await supabase
      .from("users")
      .insert([userData]);

    if (error) {
      console.error("Error:", error);
      alert("Error saving user: " + error.message);
    } else {
      console.log("User saved:", data);
      alert("User saved successfully!");
      navigate("/");
    }
  };

  return (
    <div className="user-container">
      <div className="user-card">
        <div className="user-header">
          <h1 className="user-title">Complete Your Profile</h1>
          <p className="user-sub">We received your email — finish setting up your account.</p>
        </div>

        <div className="user-info">
          <p><strong>Email:</strong> {email || '—'}</p>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <input
            className="form-input"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="form-input"
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <select className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required>
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
