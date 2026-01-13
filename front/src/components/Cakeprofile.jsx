import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function CakeOwnerProfile() {
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false); // زر واحد لكل شيء

  const handleLogout = () => {
    sessionStorage.clear(); 
    navigate("/login");
  };

  const handleProfileClick = async () => {
    const ownerId = sessionStorage.getItem("ownerId_");
    if (!ownerId) {
      alert("No owner logged in");
      return;
    }

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleOwnerChange = (e) => setOwnerData({ ...ownerData, [e.target.name]: e.target.value });
  const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });

  const saveData = async () => {
    try {
      // حفظ Owner
      const { error: ownerError } = await supabase
        .from("owners")
        .update({ description: ownerData.description })
        .eq("owner_id", ownerData.owner_id);
      if (ownerError) return alert("Failed to save owner data");

      // حفظ User
      const { error: userError } = await supabase
        .from("users")
        .update(userData)
        .eq("id", userData.id);
      if (userError) return alert("Failed to save user data");

      alert("Data updated successfully!");
      setEditing(false);
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
            <li onClick={() => navigate("/CakeOwnerPage")}>Home</li>
            <li onClick={() => navigate("/manage-items")}>Manage Items</li>
            <li onClick={() => navigate("/visit")}>Visit</li>
            <li onClick={handleProfileClick}>Profile</li>
            <li>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </nav>

      {ownerData && userData && (
        <div className="profile-dashboard">
          <button 
            className="edit-all-btn" 
            onClick={editing ? saveData : () => setEditing(true)}
          >
            {editing ? "Save All" : "Edit All"}
          </button>

          {/* Owner Info */}
          <div className="profilecardfor">
            <div className="profile-header">
             
            </div>
            <div className="profile-body">
              <div className="profile-field">
                <label>Rate</label>
                <input
                  type="text"
                  value={ownerData.rate || ""}
                  readOnly
                />
              </div>

              <div className="profile-field">
                <label>Rating Count</label>
                <input
                  type="text"
                  value={ownerData.rating_count || ""}
                  readOnly
                />
              </div>

              <div className="profile-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={ownerData.description || ""}
                  onChange={handleOwnerChange}
                  readOnly={!editing}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="profilecard222">
            <div className="profile-header">
             
            </div>
            <div className="profile-body">
              {["name", "phone", "city"].map(field => (
                <div key={field} className="profile-field">
                  <label>{field.replace("_", " ")}</label>
                  <input
                    type="text"
                    name={field}
                    value={userData[field] || ""}
                    onChange={handleUserChange}
                    readOnly={!editing}
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
