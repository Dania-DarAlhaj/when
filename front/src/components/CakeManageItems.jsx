import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function CakeManageItems() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId_"); 
  const [cakes, setCakes] = useState([]);
  const [filteredCakes, setFilteredCakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [fileName, setFileName] = useState("");
  const [cakeName, setCakeName] = useState("");
  const [searchText, setSearchText] = useState("");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const fetchCakes = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("cakes")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching cakes:", error);
    } else {
      setCakes(data);
      setFilteredCakes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCakes();
  }, [userId]);

  // update filtered cakes when search text changes
  useEffect(() => {
    const filtered = cakes.filter(cake =>
      cake.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCakes(filtered);
  }, [searchText, cakes]);

  // add new cake
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!fileName || !cakeName) return alert("Please fill all fields!");
    if (!userId) return alert("User not logged in!");

    setAdding(true);
    try {
      const { error } = await supabase.from("cakes").insert([
        {
          user_id: userId,
          imgurl: fileName,
          name: cakeName
        },
      ]);

      if (error) throw error;

      setFileName("");
      setCakeName("");
      fetchCakes(); 
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (cakeId) => {
    if (!window.confirm("Are you sure you want to delete this cake?")) return;

    try {
      const { error } = await supabase
        .from("cakes")
        .delete()
        .eq("id", cakeId);

      if (error) throw error;

      fetchCakes(); 
    } catch (err) {
      console.error("Error deleting cake:", err);
      alert("Failed to delete cake 😬");
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
            <li onClick={() => navigate("/Cakeprofile")} style={{ cursor: "pointer" }}>Profile</li>
            <li><button className="btn-logout" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </nav>

      <div style={{ padding: "30px", maxWidth: "400px" }}>
        <h2>➕ Add New Cake</h2>
        <form onSubmit={handleAddItem}>
          <div style={{ marginBottom: "15px" }}>
            <label>Cake Name</label>
            <input
              type="text"
              placeholder="Enter cake name"
              value={cakeName}
              onChange={(e) => setCakeName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Select Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFileName(e.target.files[0]?.name || "")}
              required
            />
          </div>

          <button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add Cake"}
          </button>
        </form>
      </div>

      <div style={{ padding: "30px", maxWidth: "600px" }}>
        <h2>🍰 Your Cakes</h2>
        <input
          type="text"
          placeholder="Search by cake name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: "15px", width: "100%", padding: "8px" }}
        />

        {loading ? (
          <p>Loading cakes...</p>
        ) : filteredCakes.length === 0 ? (
          <p>No cakes found.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
              
                <th>Name</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCakes.map((cake) => (
                <tr key={cake.id}>
                 
                  <td>{cake.name}</td>
                  <td>
  <img 
    src={`/img/cake/${cake.imgurl}`} 
    alt={cake.name} 
    style={{ width: "80px", height: "80px", objectFit: "cover" }}
  />
</td>


                  <td>
                    <button onClick={() => handleDelete(cake.id)} style={{ color: "red" }}>
                      Delete
                    </button>
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
