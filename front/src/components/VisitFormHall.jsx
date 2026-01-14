import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function VisitFormHall() {
  const navigate = useNavigate();
  const ownerId = sessionStorage.getItem("ownerId_");

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch visits for this owner
  useEffect(() => {
    const fetchVisits = async () => {
      const { data, error } = await supabase
        .from("visit")
        .select("*")
        .eq("owner_id", ownerId)
        .order("visit_date", { ascending: true });

      if (error) {
        console.error("Error fetching visits:", error);
      } else {
        setVisits(data);
      }
      setLoading(false);
    };

    fetchVisits();
  }, [ownerId]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
const handleAccept = async (visitId) => {
  const { error } = await supabase
    .from("visit")
    .update({ accept: true })
    .eq("id", visitId);

  if (error) {
    console.error("Error accepting visit:", error);
    alert("Something went wrong 😬");
  } else {
    // Update UI without refresh
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId ? { ...v, accept: true } : v
      )
    );
  }
};

  return (
    <div>
      {/* Navbar */}
      <nav className="owner-navbar">
        <div className="owner-navbar-container">
          <div className="owner-logo">🎂 WPS Owner</div>
          <ul className="owner-nav-links">
            <li onClick={() => navigate("/CakeOwnerPage")} style={{ cursor: "pointer" }}>Home</li>
            <li onClick={() => navigate("/manage-items")} style={{ cursor: "pointer" }}>Manage Items</li>
            <li onClick={() => navigate("/Cakevisit")} style={{ cursor: "pointer" }}>Visit</li>
            <li onClick={() => navigate("/Cakeprofile")} style={{ cursor: "pointer" }}>Profile</li>
            <li>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: "30px" }}>
        <h2>📅 Visits</h2>

        {loading ? (
          <p>Loading visits...</p>
        ) : visits.length === 0 ? (
          <p>No visits yet 😴</p>
        ) : (
          <table className="visits-table">
            <thead>
              <tr>
                
                <th>Date</th>
                <th>Time</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
              <tr key={visit.id}>
  
  <td>{visit.visit_date}</td>
  <td>{visit.visit_time}</td>
  <td>{new Date(visit.created_at).toLocaleString()}</td>

  {/* Status */}
  <td>
    {visit.accept ? (
      <span style={{ color: "green", fontWeight: "bold" }}>Accepted</span>
    ) : (
      <span style={{ color: "red", fontWeight: "bold" }}>Rejected</span>
    )}
  </td>

  {/* Action */}
  <td>
    {!visit.accept && (
      <button onClick={() => handleAccept(visit.id)}>
        Accept
      </button>
    )}
  </td>
</tr>

              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
