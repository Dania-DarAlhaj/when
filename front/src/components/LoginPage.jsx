import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../style/LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

 useEffect(() => {
  document.body.classList.add("login-page-active");

  const prevBodyOverflow = document.body.style.overflow;
  const prevHtmlOverflow = document.documentElement.style.overflow;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  return () => {
    document.body.classList.remove("login-page-active");

    document.body.style.overflow = prevBodyOverflow || "";
    document.documentElement.style.overflow = prevHtmlOverflow || "";
  };
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email === "admin@weddingplanning.com" && password === "admin") {
        alert("Welcome Admin 👑");
        navigate("/AdminPage");
        setIsLoading(false);
        return;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !user) {
        alert("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (user.role === "user") {
        sessionStorage.setItem("userId_", user.id);
        alert("Login successfully 🎉");
        navigate("/");
        setIsLoading(false);
        return;
      }

      if (user.role === "owner") {
        const { data: owner, error: ownerError } = await supabase
          .from("owners")
          .select("owner_id, user_id, owner_type")
          .eq("user_id", user.id)
          .single();

        if (ownerError || !owner) {
          alert("Owner record not found");
          setIsLoading(false);
          return;
        }

        if (owner.owner_type === "hall") {
          sessionStorage.setItem("ownerId_", user.id);
          navigate("/VenueOwnerPage", { state: { userId: user.id } });
        } 
       else if (owner.owner_type === "cake") {
  sessionStorage.setItem("ownerId_", owner.owner_id); // اختياري إذا بدك تخزني
    sessionStorage.setItem("userId_", user.id); 
  navigate(`/CakeOwnerPage/${owner.owner_id}`);
}

        else {
          alert("Unknown owner type");
        }

        setIsLoading(false);
        return;
      }

      alert("Unknown role");
      setIsLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎉</div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? "Signing in..." : "LOG IN"}
          </button>
        </form>
      </div>
    </div>
  );
}
