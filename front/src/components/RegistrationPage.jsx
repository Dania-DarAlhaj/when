
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../style/RegistrationPage.css";


export default function RegistrationPage() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    // Validate password presence
    if (!password) {
      setMessage("Please enter a password.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        // attach role in user_metadata so you can access it after verification
        data: { role },
        emailRedirectTo: "http://localhost:3000/VerifyPage",
      }
    );

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    sessionStorage.setItem("pendingEmail", email);
    sessionStorage.setItem("pendingPassword", password);
    sessionStorage.setItem("pendingRole", role);
    sessionStorage.setItem("linkSentTime", Date.now());

  
   
    navigate("/VerifyPage");

    setMessage("Check your email for the verification link.");
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L15 8l6 1-4.5 4 1 6L12 17l-7.5 3 1-6L1 9l6-1 3-7z" />
            </svg>
          </div>
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join us and start your journey</p>
        </div>

        <form onSubmit={handleContinue}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper inline">
              <span className="input-icon">📧</span>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper inline">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm password removed as requested */}

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-selection">
              <div className="role-option">
                <input
                  type="radio"
                  id="role-user"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label htmlFor="role-user" className="role-label">
                  <div className="role-icon" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#5B2D70"/>
                      <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="#7A4A5A"/>
                    </svg>
                  </div>
                  <div className="role-name">User</div>
                  <div className="role-desc">Browse & Book</div>
                </label>
              </div>

              <div className="role-option">
                <input
                  type="radio"
                  id="role-owner"
                  name="role"
                  value="owner"
                  checked={role === "owner"}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label htmlFor="role-owner" className="role-label">
                  <div className="role-icon" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="7" width="18" height="12" rx="2" fill="#7A4A5A"/>
                      <path d="M8 7V6a4 4 0 018 0v1" stroke="#4A2B2B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="7" width="18" height="4" fill="#F5EFEA" opacity="0.15"/>
                    </svg>
                  </div>
                  <div className="role-name">Business Owner</div>
                  <div className="role-desc">Manage Services</div>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading && <span className="loading-spinner" />}
            {loading ? "Processing..." : "Create Account"}
          </button>

          {message && (
            <div className={`message-box ${message.toLowerCase().includes('error') ? 'message-error' : 'message-success'}`}>
              {message}
            </div>
          )}

          <div className="card-footer">
            <div className="divider"><span>OR</span></div>

            <div className="login-link">
              <button type="button" onClick={() => navigate('/login')}>Already have an account? Log in</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
