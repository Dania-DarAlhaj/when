import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import '../style/VenueOwnerPage.css';

export default function VenueOwnerPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;
  const [ownerData, setOwnerData] = useState(null);
  const [halls, setHalls] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [hallEdits, setHallEdits] = useState({});
  const [hallImages, setHallImages] = useState({}); 

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchOwnerWithUser = async () => {
      const { data, error } = await supabase
        .from("owners")
        .select(`
          *,
          users:user_id (id, name, email, phone, city)
        `)
        .eq("user_id", userId)
        .single();

      if (!error) {
        setOwnerData(data);
        setFormData({
          owner_type: data.owner_type,
          description: data.description,
          rate: data.rate,
          name: data.users?.name || "",
          phone: data.users?.phone || "",
          city: data.users?.city || ""
        });

        const { data: hallData } = await supabase
          .from("hall")
          .select("*")
          .eq("owner_id", data.owner_id);

        setHalls(hallData || []);
        const images = {};
        hallData.forEach(hall => {
          images[hall.hall_id] = hall.imgurl ? hall.imgurl.split(",") : [];
        });
        setHallImages(images);
        
        const edits = {};
        hallData.forEach(hall => {
          edits[hall.hall_id] = {
            hall_type: hall.hall_type,
            men_capacity: hall.men_capacity,
            women_capacity: hall.women_capacity,
            price: hall.price
          };
        });
        setHallEdits(edits);
      }
    };

    fetchOwnerWithUser();
  }, [userId, navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleHallChange = (hallId, e) => {
    setHallEdits(prev => ({ ...prev, [hallId]: { ...prev[hallId], [e.target.name]: e.target.value } }));
  };

  const handleSaveAll = async () => {
    await supabase.from("owners").update({
      owner_type: formData.owner_type,
      description: formData.description,
      rate: formData.rate
    }).eq("owner_id", ownerData.owner_id);

    await supabase.from("users").update({
      name: formData.name,
      phone: formData.phone,
      city: formData.city
    }).eq("id", ownerData.user_id);

    for (const hallId in hallEdits) {
      const h = hallEdits[hallId];
      await supabase.from("hall").update({
        hall_type: h.hall_type,
        men_capacity: parseInt(h.men_capacity),
        women_capacity: parseInt(h.women_capacity),
        price: parseFloat(h.price)
      }).eq("hall_id", hallId);
    }

    alert("All changes saved!");
    setEditMode(false);
    setOwnerData({
      ...ownerData,
      owner_type: formData.owner_type,
      description: formData.description,
      rate: formData.rate,
      users: { ...ownerData.users, name: formData.name, phone: formData.phone, city: formData.city }
    });
    setHalls(prev => prev.map(h => ({ ...h, ...hallEdits[h.hall_id] })));
  };

  const handleRemoveImage = (hallId, index) => {
    setHallImages(prev => {
      if (prev[hallId].length <= 1) return prev;
      const newImages = [...prev[hallId]];
      newImages.splice(index, 1);
      return { ...prev, [hallId]: newImages };
    });
  };
const formatHallName = (name) =>
  name.replace(/\s+/g, "_");

  const handleAddImages = (hallId, e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setHallImages(prev => ({
      ...prev,
      [hallId]: [...prev[hallId], ...urls]
    }));
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (!ownerData) return <p>Loading owner data...</p>;

  return (
    <div className="owner-details-page">

      {/* === NAVBAR === */}
      <nav className="navbar">
        <div className="navbar-left">
          <button onClick={() => setEditMode(false)}>Profile</button>
          <button onClick={() => navigate("/VisitFormHall", { state: { userId } })}>Visit Form</button>
<button
  onClick={() =>
    navigate(`/OwnerSearchBookings/${ownerData.owner_id}`)
  }
>
  Search
</button>

          <button onClick={() => navigate("/AddBookingByOwnerHall", { state: { userId } })}>Add Booking</button>
          <button onClick={() => navigate("/booking-details", { state: { userId } })}>See Booking Details</button>
        </div>
        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* === PAGE TITLE === */}
      <h2>Owner & Hall Details</h2>
      
      {/* === OWNER INFO SECTION === */}
      <form className="section">
        <p>Information about the business</p>
        
        <div className="form-grid">
          <label>
            <span>Description</span>
            <input 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              disabled={!editMode} 
            />
          </label>

          <label>
            <span>Rate</span>
            <input 
              name="rate" 
              type="number" 
              value={formData.rate} 
              disabled 
            />
          </label>

          <label>
            <span>Hall Name</span>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              disabled={!editMode} 
            />
          </label>

          <label>
            <span>Email</span>
            <input 
              value={ownerData.users?.email} 
              disabled 
            />
          </label>

          <label>
            <span>Phone</span>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              disabled={!editMode} 
            />
          </label>

          <label>
            <span>City</span>
            <select 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              disabled={!editMode}
            >
              <option value="">Select a city</option>
              <option value="Ramallah">Ramallah</option>
              <option value="Jerusalem">Jerusalem</option>
              <option value="Bethlehem">Bethlehem</option>
              <option value="Nablus">Nablus</option>
              <option value="Gaza">Gaza</option>
              <option value="Hebron">Hebron</option>
              <option value="Jenin">Jenin</option>
              <option value="Tulkarm">Tulkarm</option>
              <option value="Qalqilya">Qalqilya</option>
              <option value="Salfit">Salfit</option>
              <option value="Tubas">Tubas</option>
              <option value="Jericho">Jericho</option>
            </select>
          </label>
        </div>
      </form>

      {/* === HALL CARDS === */}
      {halls.map(hall => (
        <div key={hall.hall_id} className="hall-card">
          <label>
            <span>Hall Type</span>
            <input 
              name="hall_type" 
              value={hallEdits[hall.hall_id].hall_type} 
              onChange={(e) => handleHallChange(hall.hall_id, e)} 
              disabled={!editMode} 
            />
          </label>

          <label>
            <span>Men Capacity</span>
            <input 
              name="men_capacity" 
              type="number" 
              value={hallEdits[hall.hall_id].men_capacity} 
              onChange={(e) => handleHallChange(hall.hall_id, e)} 
              disabled={!editMode} 
            />
          </label>

          <label>
            <span>Women Capacity</span>
            <input 
              name="women_capacity" 
              type="number" 
              value={hallEdits[hall.hall_id].women_capacity} 
              onChange={(e) => handleHallChange(hall.hall_id, e)} 
              disabled={!editMode} 
            />
          </label>

          <label>
            <span>Price</span>
            <input 
              name="price" 
              type="number" 
              value={hallEdits[hall.hall_id].price} 
              onChange={(e) => handleHallChange(hall.hall_id, e)} 
              disabled={!editMode} 
            />
          </label>

         <div className="hall-images">
  {hallImages[hall.hall_id].map((_, index) => (
    <div key={index} className="hall-image-wrapper">
      <img
        src={`/img/hall/${formatHallName(hall.imgurl)}`}
        alt={`${hall.imgurl} ${index + 1}`}
      />

      {editMode && hallImages[hall.hall_id].length > 1 && (
        <button
          type="button"
          onClick={() => handleRemoveImage(hall.hall_id, index)}
        >
          ×
        </button>
      )}
    </div>
  ))}

            {editMode && (
              <input 
                type="file" 
                multiple 
                onChange={(e) => handleAddImages(hall.hall_id, e)} 
              />
            )}
          </div>
        </div>
      ))}

      {/* === ACTION BUTTONS === */}
      <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
        {editMode ? "Cancel" : "Edit All"}
      </button>

      {editMode && (
        <button type="button" className="save-btn" onClick={handleSaveAll}>
          Save All Changes
        </button>
      )}
    </div>
  );
}