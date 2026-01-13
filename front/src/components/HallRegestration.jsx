// src/pages/HallRegistration.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function HallRegistration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hallType, setHallType] = useState("");
  const [parking, setParking] = useState(false);
  const [menCapacity, setMenCapacity] = useState("");
  const [womenCapacity, setWomenCapacity] = useState("");
  const [hallInfo, setHallInfo] = useState(null);

  // Store image names locally before inserting to DB
  const [imageNames, setImageNames] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  // Get business info from session storage
  const name = sessionStorage.getItem("businessName");
  const phone = sessionStorage.getItem("phone");
  const city = sessionStorage.getItem("city");
  const description = sessionStorage.getItem("description");

  // Add selected image name to the list
  const addImageName = () => {
    if (!currentImage) {
      alert("Please select an image first.");
      return;
    }

    setImageNames([...imageNames, currentImage.name]); // Add current image name to array
    setCurrentImage(null); // Reset file input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!email || !password || !hallType || !menCapacity || !womenCapacity || !description) {
      alert("Please complete all fields.");
      return;
    }

    if (imageNames.length === 0) {
      alert("Please add at least one image name.");
      return;
    }

    try {
      // Insert user
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([{
          email,
          password,
          role: "owner",
          name,
          phone,
          city,
          verified: true,
        }])
        .select();

      if (userError) throw userError;
      const userId = userData[0].id;
      console.log("User Inserted:", userData);

      // Insert owner
      const { data: ownerData, error: ownerError } = await supabase
        .from("owners")
        .insert([{
          user_id: userId,
          owner_type: "hall",
          visible: false,
          description: description,
          rate: 0,
          accept: false
        }])
        .select("owner_id");

      if (ownerError) throw ownerError;
      const ownerId = ownerData[0].owner_id;
      console.log("Owner Inserted:", ownerData);

      // Insert hall
      const hallPrice = parseFloat(
        document.getElementById("hallPrice").value || 0
      );

      const { data: hallData, error: hallError } = await supabase
        .from("hall")
        .insert([{
          owner_id: ownerId,
          hall_type: hallType,
          parking: parking,
          men_capacity: parseInt(menCapacity),
          women_capacity: parseInt(womenCapacity),
          price: hallPrice,
          imgurl: imageNames.join(",") // Store image names as comma-separated string
        }])
        .select();

      if (hallError) throw hallError;
      console.log("Hall Inserted:", hallData);

      setHallInfo(hallData[0]);
      alert("Hall registered successfully!");
      setImageNames([]); // Reset image names after submission
    } catch (err) {
      console.error("Registration error:", err);
      alert("Error registering hall. Check console for details.");
    }
  };

  return (
    <div style={{
      fontFamily: "Lato, sans-serif",
      background: "#FAF8F5",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "450px",
        background: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Hall Registration</h2>

        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label>Password:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <label>Hall Type:</label>
          <select value={hallType} onChange={e => setHallType(e.target.value)} required>
            <option value="">-- Select Type --</option>
            <option value="Indoor Hall">Indoor Hall</option>
            <option value="Outdoor Hall">Outdoor Hall</option>
            <option value="Garden">Garden</option>
            <option value="Hotel">Hotel</option>
          </select>

          <label>
            <input type="checkbox" checked={parking} onChange={e => setParking(e.target.checked)} />
            Private Parking Available
          </label>

          <label>Men Capacity:</label>
          <input type="number" min="0" value={menCapacity} onChange={e => setMenCapacity(e.target.value)} required />

          <label>Women Capacity:</label>
          <input type="number" min="0" value={womenCapacity} onChange={e => setWomenCapacity(e.target.value)} required />

          <label>Price:</label>
          <input type="number" min="0" id="hallPrice" placeholder="Enter hall price" />

          <label>Upload Hall Images:</label>
          <input type="file" accept="image/*" onChange={(e) => setCurrentImage(e.target.files[0])} />
          <button type="button" onClick={addImageName}>Add Image Name</button>

          {/* Display added image names */}
          <div style={{ marginTop: "0.5rem" }}>
            {imageNames.length > 0 && (
              <>
                <strong>Selected Images:</strong>
                <ul>
                  {imageNames.map((name, index) => <li key={index}>{name}</li>)}
                </ul>
              </>
            )}
          </div>

          <button type="submit" style={{ marginTop: "1rem" }}>Register Hall</button>
        </form>

        {/* Display registered hall info */}
        {hallInfo && (
          <div style={{ marginTop: "2rem", padding: "1rem", background: "#f2f2f2", borderRadius: "5px" }}>
            <h3>Hall Information</h3>
            <p><strong>Hall ID:</strong> {hallInfo.hall_id}</p>
            <p><strong>Type:</strong> {hallInfo.hall_type}</p>
            <p><strong>Parking:</strong> {hallInfo.parking ? "Available" : "Not Available"}</p>
            <p><strong>Men Capacity:</strong> {hallInfo.men_capacity}</p>
            <p><strong>Women Capacity:</strong> {hallInfo.women_capacity}</p>
            <p><strong>Owner ID:</strong> {hallInfo.owner_id}</p>
            <p><strong>Images:</strong> {hallInfo.imgurl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
