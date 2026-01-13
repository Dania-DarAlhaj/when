import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
export default function OwnerPage() {
  const navigate = useNavigate();

 
const email = sessionStorage.getItem("pendingEmail");
const password = sessionStorage.getItem("pendingPassword");
const role = sessionStorage.getItem("pendingRole");


  const [ownerType, setOwnerType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const handleNext = async (e) => {
    e.preventDefault();

    // check that the user insert all the required fields
    if (!ownerType || !businessName || !phone || !city) {
      alert("Please fill in all fields.");
      return;
    }

    // check the business name validation
    const businessRegex = /^[A-Za-z0-9 ]+$/;
    if (!businessRegex.test(businessName)) {
      alert("Business name can only contain letters, numbers, and spaces.");
      return;
    }

    // check the Phone validation
    if (phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    const phoneStart = phone.slice(0, 3);
    if (phoneStart !== "056" && phoneStart !== "059") {
      alert("Phone number must start with 056 or 059.");
      return;
    }

    const phoneRegex = /^05(6|9)\d{7}$/;
    if (!phoneRegex.test(phone)) {
      alert("Invalid phone number format.");
      return;
    }

   


    sessionStorage.setItem("pendingRole", ownerType);
  sessionStorage.setItem("businessName", businessName);
  sessionStorage.setItem("phone", phone);
  sessionStorage.setItem("city", city);
  sessionStorage.setItem("pendingEmail", email);
  sessionStorage.setItem("pendingPassword", password);
  sessionStorage.setItem("description", document.getElementById("description").value);
    // Cake 
  if (ownerType === "cake") {
  const userObj = {
    email,
    password,
    role: "cake",
    name: businessName,
    phone,
    city,
    verified: true
  };

  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert([userObj])
    .select(); // select to get the user id that has beensaved in the user 

  if (userError) {
    console.error("Error saving user:", userError);
    alert("Error saving user. Please try again.");
    return;
  }

  // insert into owners
  const ownerData = {
    user_id: userData[0].id, // user id
    owner_type: "cake",
    visible: false
  };

  const { data: ownerInsert, error: ownerError } = await supabase
    .from("owners")
    .insert([ownerData]);

  if (ownerError) {
    console.error("Error saving cake owner:", ownerError);
    alert("Error sending request. Please try again.");
  } else {
    alert("Your request has been sent to the admin. Please wait for approval.");
    navigate("/"); 
  }

  return;
}
  



    // Navigation for other types
    if (ownerType === "DJ") {navigate("/dj-page");}

 else if (ownerType === "decoration") {

      navigate("/DecorationPage");
    }
    else if (ownerType === "hall") navigate("/HallRegestration");
    else if (ownerType === "photography") navigate("/photography-page");
   
      
      
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      fontFamily: "Lato"
    }}>
      <h2 style={{ textAlign: "center" }}>Owner Information</h2>

     
      {/* business name */}
      <label style={{ marginTop: "1rem", display: "block" }}>
        <strong>Business Name:</strong>
      </label>
      <input
        type="text"
        placeholder="Enter your business name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
      />

      {/* phone number */}
      <label style={{ marginTop: "1rem", display: "block" }}>
        <strong>Phone Number:</strong>
      </label>
      <input
        type="tel"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
      />

      {/* city */}
      <label style={{ marginTop: "1rem", display: "block" }}>
        <strong>City:</strong>
      </label>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
      >
        <option value="">-- Choose your city --</option>
        <option value="Ramallah">Ramallah</option>
        <option value="Hebron">Hebron</option>
        <option value="Nablus">Nablus</option>
        <option value="Tulkarm">Tulkarm</option>
        <option value="Qalqilya">Qalqilya</option>
        <option value="Jenin">Jenin</option>
        <option value="Bethlehem">Bethlehem</option>
        <option value="Jericho">Jericho</option>
        <option value="Salfit">Salfit</option>
        <option value="Tubas">Tubas</option>
      </select>

      {/* owner type */}
      <label style={{ marginTop: "1rem", display: "block" }}>
        <strong>Business Type:</strong>
      </label>
      <select
        value={ownerType}
        onChange={(e) => setOwnerType(e.target.value)}
        style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
      >
        <option value="">-- Choose your service --</option>
        <option value="cake">Cake</option>
        <option value="photography">Photography</option>
        <option value="hall">Hall</option>
        <option value="DJ">DJ</option>
        <option value="decoration">Decoration</option>
      </select>
{/* description */}
<label style={{ marginTop: "1rem", display: "block" }}>
  <strong>Description (HTML allowed):</strong>
</label>
<textarea
  placeholder="Write the description that will show to the user about your business..."
 id="description"
  rows={5}
  style={{
    width: "100%",
    padding: "0.7rem",
    marginTop: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontFamily: "monospace"
  }}
/>

      {/* next button */}
      <button
        onClick={handleNext}
        style={{
          width: "100%",
          padding: "0.8rem",
          background: "#C9A27C",
          border: "none",
          borderRadius: "5px",
          color: "white",
          fontSize: "1rem",
          marginTop: "1.5rem",
          cursor: "pointer"
        }}
      >
        Next
      </button>
    </div>
  );
}
