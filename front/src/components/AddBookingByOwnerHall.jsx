import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import '../style/VenueOwnerPage.css';
import '../style/AddBookingByOwnerHall.css';

export default function AddBookingByOwnerHall() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchDate, setSearchDate] = useState("");
const [editMode, setEditMode] = useState(false);
const [editingBookingId, setEditingBookingId] = useState(null);
const [editingId, setEditingId] = useState(null);
const [editRow, setEditRow] = useState({});

  const userId = location.state?.userId;
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    description: "",
    finalPrice: "",
    booking_date: ""
  });

  // fetch halls automatically based on user_id
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchHalls = async () => {
      const { data: ownerData, error: ownerError } = await supabase
        .from("owners")
        .select("owner_id")
        .eq("user_id", userId)
        .single();

      if (ownerError) {
        console.error("Error fetching owner:", ownerError);
        return;
      }

      const owner_id = ownerData.owner_id;

      const { data: ownerHalls, error: hallError } = await supabase
        .from("hall")
        .select("*")
        .eq("owner_id", owner_id);

      if (hallError) {
        console.error("Error fetching halls:", hallError);
      } else {
        setHalls(ownerHalls || []);
      }
    };

    fetchHalls();
  }, [userId, navigate]);

  // fetch bookings whenever halls are loaded
  useEffect(() => {
    if (!halls.length) return;

    const fetchBookings = async () => {
      const hallIds = halls.map(h => h.hall_id);
      const { data, error } = await supabase
        .from("booking_by_owner")
        .select("*")
        .in("hall_id", hallIds)
        .order("booking_date", { ascending: false });

      if (error) console.error("Error fetching bookings:", error);
      else setBookings(data);
    };

    fetchBookings();
  }, [halls]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddBooking = async () => {
    if (!halls.length) {
      alert("No halls found for this owner!");
      return;
    }

    const hall_id = halls[0].hall_id; // first hall by default

    if (!formData.name || !formData.phone || !formData.city || !formData.finalPrice || !formData.booking_date) {
      alert("Please fill all required fields!");
      return;
    }

    const { data, error } = await supabase
      .from("booking_by_owner")
      .insert([{
        hall_id,
        user_name: formData.name,
        user_phone: formData.phone,
        city: formData.city,
        description: formData.description,
        final_price: parseFloat(formData.finalPrice),
        booking_date: formData.booking_date
      }]);

    if (error) {
      console.error("Error adding booking:", error);
      alert("Failed to add booking. Check console.");
    } else {
      alert("Booking added successfully!");
      setFormData({
        name: "",
        phone: "",
        city: "",
        description: "",
        finalPrice: "",
        booking_date: ""
      });
      setBookings(prev => [{ hall_id, user_name: formData.name, user_phone: formData.phone, city: formData.city, description: formData.description, final_price: parseFloat(formData.finalPrice), booking_date: formData.booking_date, id: Date.now() }, ...prev]);
    }
    setSearchName("");
    setSearchPhone("");
    setSearchDate("");
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    const { error } = await supabase
      .from("booking_by_owner")
      .delete()
      .eq("id", bookingId);

    if (error) {
      alert("Failed to delete booking. Check console.");
      console.error(error);
    } else {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      alert("Booking cancelled successfully.");
    }
  };

  const handleEditBooking = (booking) => {
  setFormData({
    name: booking.user_name,
    phone: booking.user_phone,
    city: booking.city,
    description: booking.description,
    finalPrice: booking.final_price,
    booking_date: booking.booking_date
  });

  setEditMode(true);
  setEditingBookingId(booking.id);

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const startEdit = (booking) => {
  // نحدد أي صف جاري التعديل عليه باستخدام booking_id
  setEditingId(booking.booking_id);

  // نحفظ نسخة من بيانات الصف في editRow عشان نقدر نعدلها مباشرة
  setEditRow({
    user_name: booking.user_name,
    user_phone: booking.user_phone,
    city: booking.city,
    description: booking.description,
    final_price: booking.final_price,
    booking_date: booking.booking_date
  });

  // Scroll للجزء العلوي إذا تحب لتسهيل التعديل
  window.scrollTo({ top: 0, behavior: "smooth" });
};


const handleRowChange = (e) => {
  setEditRow(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};
const saveEdit = async (bookingId) => {
  if (!bookingId) {
    console.error("bookingId is missing");
    return;
  }

  const { error } = await supabase
    .from("booking_by_owner")
    .update({
      user_name: editRow.user_name,
      user_phone: editRow.user_phone,
      city: editRow.city,
      description: editRow.description,
      final_price: parseFloat(editRow.final_price),
      booking_date: editRow.booking_date
    })
    .eq("booking_id", bookingId); 

  if (error) {
    console.error(error);
    alert("Update failed");
    return;
  }

  setBookings(prev =>
    prev.map(b =>
      b.booking_id === bookingId ? { ...b, ...editRow } : b
    )
  );

  setEditingId(null);
  setEditRow({});
};

const cancelEdit = () => {
  setEditingId(null);
  setEditRow({});
};

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const filteredBookings = bookings.filter(b => {
    const matchName =
      searchName === "" ||
      b.user_name.toLowerCase().includes(searchName.toLowerCase());

    const matchPhone =
      searchPhone === "" ||
      b.user_phone.includes(searchPhone);

    const matchDate =
      searchDate === "" ||
      b.booking_date === searchDate;

    return matchName && matchPhone && matchDate;
  });

  return (
    <div className="owner-details-page">

      {/* === NAVBAR === */}
      <nav className="navbar">
        <div className="navbar-left">
          <button onClick={() => navigate("/VenueOwnerPage", { state: { userId } })}>Profile</button>
          <button onClick={() => navigate("/visit-form", { state: { userId } })}>Visit Form</button>
          <button onClick={() => navigate("/OwnerSearchBookings")}>Search</button>
          <button>Add Booking</button>
          <button onClick={() => navigate("/SeeBookingDetailsHall", { state: { userId } })}>Manage Bookings</button>
        </div>
        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="booking-container">

        {/* Existing Bookings - Left */}
        <div className="booking-list">
          <div className="booking-filter">
            <div className="booking-filters">
              <input
                type="text"
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Search by phone"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />

              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
          </div>

          <h3>Existing Bookings</h3>
          {filteredBookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Description</th>
                  <th>Final Price</th>
                  <th>Booking Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
             <tbody>
  {
  filteredBookings.map(b => (
    <tr key={b.booking_id}>
      <td>
        {editingId === b.booking_id ? (
          <input
            name="user_name"
            value={editRow.user_name}
            onChange={handleRowChange}
          />
        ) : b.user_name}
      </td>

      <td>
        {editingId === b.booking_id ? (
          <input
            name="user_phone"
            value={editRow.user_phone}
            onChange={handleRowChange}
          />
        ) : b.user_phone}
      </td>

      <td>
        {editingId === b.booking_id ? (
          <select
            name="city"
            value={editRow.city}
            onChange={handleRowChange}
          >
            <option value="Ramallah">Ramallah</option>
            <option value="Nablus">Nablus</option>
            <option value="Hebron">Hebron</option>
            <option value="Jericho">Jericho</option>
            <option value="Bethlehem">Bethlehem</option>
            <option value="Jenin">Jenin</option>
            <option value="Tulkarm">Tulkarm</option>
            <option value="Qalqilya">Qalqilya</option>
            <option value="Jerusalem">Jerusalem</option>
            <option value="Gaza">Gaza</option>
            <option value="Rafah">Rafah</option>
            <option value="Khan Yunis">Khan Yunis</option>
          </select>
        ) : b.city}
      </td>

      <td>
        {editingId === b.booking_id ? (
          <input
            name="description"
            value={editRow.description}
            onChange={handleRowChange}
          />
        ) : b.description}
      </td>

      <td>
        {editingId === b.booking_id ? (
          <input
            type="number"
            name="final_price"
            value={editRow.final_price}
            onChange={handleRowChange}
          />
        ) : b.final_price}
      </td>

      <td>
        {editingId === b.booking_id ? (
          <input
            type="date"
            name="booking_date"
            value={editRow.booking_date}
            onChange={handleRowChange}
          />
        ) : b.booking_date}
      </td>

      <td>
        {editingId === b.booking_id ? (
          <>
          <button onClick={() => {
  setEditingId(b.booking_id);
  saveEdit(b.booking_id);
}}>
  Edit
</button>

            <button className="cancel" onClick={cancelEdit}>Cancel</button>
          </>
        ) : (
          <>
            <button className="edit" onClick={() => startEdit(b)}>Edit</button>
            <button className="cancel" onClick={() => handleDeleteBooking(b.id)}>Cancel</button>
          </>
        )}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          )}
        </div>

        {/* Add Booking Form - Right */}
        <div className="add-booking-form">
          <h2>Add Booking</h2>

          <label>
            <span>Name</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </label>

          <label>
            <span>Phone</span>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </label>

          <label>
            <span>City</span>
            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="">Select a city</option>
              <option value="Ramallah">Ramallah</option>
              <option value="Nablus">Nablus</option>
              <option value="Hebron">Hebron</option>
              <option value="Jericho">Jericho</option>
              <option value="Bethlehem">Bethlehem</option>
              <option value="Jenin">Jenin</option>
              <option value="Tulkarm">Tulkarm</option>
              <option value="Qalqilya">Qalqilya</option>
              <option value="Jerusalem">Jerusalem</option>
       
            </select>
          </label>

          <label>
            <span>Description / Notes</span>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          </label>

          <label>
            <span>Final Price</span>
            <input type="number" name="finalPrice" value={formData.finalPrice} onChange={handleChange} />
          </label>

          <label>
            <span>Booking Date</span>
            <input type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} />
          </label>

          <button type="button" onClick={handleAddBooking}>Add Booking</button>
        </div>

      </div>
    </div>
  );
}