import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function CakeOwnerProfile() {
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editingOwner, setEditingOwner] = useState(false);
  const [editingUser, setEditingUser] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleProfileClick = async () => {
    const ownerId = sessionStorage.getItem("ownerId_");
    if (!ownerId) return alert("No owner logged in");

    try {
      const { data: owner, error: ownerError } = await supabase
        .from("owners")
        .select("*")
        .eq("owner_id", ownerId)
        .single();
      if (ownerError || !owner) return alert("Error fetching owner info");
      setOwnerData(owner);

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", owner.user_id)
        .single();
      if (userError || !user) return alert("Error fetching user info");
      setUserData(user);

      navigate("/Cakeprofile");
    } catch (err) {
      console.error(err);
    }
  };

  const handleOwnerChange = (e) => setOwnerData({ ...ownerData, [e.target.name]: e.target.value });
  const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });

  const saveOwnerData = async () => {
    try {
      const { error } = await supabase
        .from("owners")
        .update(ownerData)
        .eq("owner_id", ownerData.owner_id);
      if (error) return alert("Failed to save owner data");
      alert("Owner data updated successfully!");
      setEditingOwner(false);
    } catch (err) {
      console.error(err);
    }
  };

  const saveUserData = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", userData.id);
      if (error) return alert("Failed to save user data");
      alert("User data updated successfully!");
      setEditingUser(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <nav className="owner-navbar">
        <div className="owner-navbar-container">
          <div className="owner-logo">🎂 WPS Owner</div>
          <ul className="owner-nav-links">
            <li onClick={() => navigate("/CakeOwnerPage")} style={{ cursor: "pointer" }}>Home</li>
            <li onClick={() => navigate("/CakeManageItems")} style={{ cursor: "pointer" }}>Manage Items</li>
            <li onClick={() => navigate("/Cakevisit")} style={{ cursor: "pointer" }}>Visit</li>
            <li onClick={handleProfileClick} style={{ cursor: "pointer" }}>Profile</li>
            <li><button className="btn-logout" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </nav>

      {ownerData && userData && (
        <div className="profile-dashboard">
          {/* Owner Info */}
          <div className="profile-card">
            <div className="profile-header">
              <h2>Owner Info</h2>
              <button onClick={() => editingOwner ? saveOwnerData() : setEditingOwner(true)}>
                {editingOwner ? "Save" : "Edit"}
              </button>
            </div>
            <div className="profile-body">
              {["owner_id","owner_type","created_at","visible","rate","accept","description","rating_count"].map(field => (
                <div key={field} className="profile-field">
                  <label>{field.replace("_", " ")}</label>
                  <input
                    type="text"
                    name={field}
                    value={ownerData[field] || ""}
                    onChange={handleOwnerChange}
                    readOnly={!editingOwner}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="profile-card">
            <div className="profile-header">
              <h2>User Info</h2>
              <button onClick={() => editingUser ? saveUserData() : setEditingUser(true)}>
                {editingUser ? "Save" : "Edit"}
              </button>
            </div>
            <div className="profile-body">
              {["id","role","name","phone","city","verified","created_at"].map(field => (
                <div key={field} className="profile-field">
                  <label>{field.replace("_", " ")}</label>
                  <input
                    type="text"
                    name={field}
                    value={userData[field] || ""}
                    onChange={handleUserChange}
                    readOnly={!editingUser}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
