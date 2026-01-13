import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import '../style/OwnerSearchBookings.css';

export default function ReservationsTable() {
  const [reservations, setReservations] = useState([]);
  const [bookingsByOwner, setBookingsByOwner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Search state
  const [searchParams, setSearchParams] = useState({
    bookingDate: "",
    userName: "",
    userPhone: ""
  });

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentEditType, setCurrentEditType] = useState("");
  const [currentEditId, setCurrentEditId] = useState(null);
  const [editReservationData, setEditReservationData] = useState({});
  const [editBookingData, setEditBookingData] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  // ====================== FETCH ALL DATA ON LOAD ======================
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Fetch reservations - استخدام reservation_date
        const { data: reservationsData, error: resError } = await supabase
          .from("reservations")
          .select("*")
          .order("reservation_date", { ascending: false });

        if (resError) throw resError;
        setReservations(reservationsData || []);

        // 2. Fetch all bookings (no filtering initially)
        const { data: bookingsData, error: bookError } = await supabase
          .from("booking_by_owner")
          .select("*")
          .order("booking_date", { ascending: false });

        if (bookError) throw bookError;
        setBookingsByOwner(bookingsData || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ====================== HANDLE SEARCH ======================
  const handleSearchChange = (e) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      // Apply filters to reservations - استخدام reservation_date
      let reservationsQuery = supabase
        .from("reservations")
        .select("*");

      if (searchParams.bookingDate) {
        reservationsQuery = reservationsQuery.eq("reservation_date", searchParams.bookingDate);
      }

      const { data: reservationsData, error: resError } = await reservationsQuery;

      // Apply filters to bookings_by_owner
      let bookingsQuery = supabase
        .from("booking_by_owner")
        .select("*");

      if (searchParams.bookingDate) {
        bookingsQuery = bookingsQuery.eq("booking_date", searchParams.bookingDate);
      }
      if (searchParams.userName) {
        bookingsQuery = bookingsQuery.ilike("user_name", `%${searchParams.userName}%`);
      }
      if (searchParams.userPhone) {
        bookingsQuery = bookingsQuery.ilike("user_phone", `%${searchParams.userPhone}%`);
      }

      const { data: bookingsData, error: bookError } = await bookingsQuery;

      if (resError || bookError) {
        console.error("Search error:", resError || bookError);
        alert("Search error");
      } else {
        setReservations(reservationsData || []);
        setBookingsByOwner(bookingsData || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchParams({ bookingDate: "", userName: "", userPhone: "" });
    // Re-fetch all data
    setSearchLoading(true);
    supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: false })
      .then(({ data: resData }) => {
        setReservations(resData || []);
        return supabase
          .from("booking_by_owner")
          .select("*")
          .order("booking_date", { ascending: false });
      })
      .then(({ data: bookData }) => {
        setBookingsByOwner(bookData || []);
        setSearchLoading(false);
      })
      .catch(error => {
        console.error("Error clearing search:", error);
        setSearchLoading(false);
      });
  };

  const hasSearchParams = searchParams.bookingDate || searchParams.userName || searchParams.userPhone;

  // ====================== EDIT FUNCTIONS ======================
  const handleEditClick = (type, item) => {
    setCurrentEditType(type);
    setCurrentEditId(type === "reservation" ? item.reservations_id : item.booking_id);

    if (type === "reservation") {
      setEditReservationData({
        price: item.price,
        status: item.status,
        description: item.description
      });
    } else {
      setEditBookingData({
        user_name: item.user_name,
        user_phone: item.user_phone,
        city: item.city,
        final_price: item.final_price,
        booking_date: item.booking_date,
        description: item.description
      });
    }

    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (currentEditType === "reservation") {
        // حفظ التعديلات في Supabase أولاً
        const { error } = await supabase
          .from("reservations")
          .update({
            price: parseFloat(editReservationData.price),
            status: editReservationData.status,
            description: editReservationData.description
          })
          .eq("reservations_id", currentEditId);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        // بعد النجاح، تحديث الشاشة
        setReservations(prev =>
          prev.map(r => r.reservations_id === currentEditId ? { 
            ...r, 
            price: parseFloat(editReservationData.price),
            status: editReservationData.status,
            description: editReservationData.description
          } : r)
        );
        
        alert("Reservation updated successfully on server!");
      } else {
        // حفظ التعديلات في Supabase أولاً
        const { error } = await supabase
          .from("booking_by_owner")
          .update({
            user_name: editBookingData.user_name,
            user_phone: editBookingData.user_phone,
            city: editBookingData.city,
            final_price: parseFloat(editBookingData.final_price),
            booking_date: editBookingData.booking_date,
            description: editBookingData.description
          })
          .eq("booking_id", currentEditId);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        // بعد النجاح، تحديث الشاشة
        setBookingsByOwner(prev =>
          prev.map(b => b.booking_id === currentEditId ? { 
            ...b, 
            user_name: editBookingData.user_name,
            user_phone: editBookingData.user_phone,
            city: editBookingData.city,
            final_price: parseFloat(editBookingData.final_price),
            booking_date: editBookingData.booking_date,
            description: editBookingData.description
          } : b)
        );
        
        alert("Booking updated successfully on server!");
      }

      setShowEditDialog(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed: " + (err.message || "Unknown error"));
    }
  };

  // ====================== DELETE FUNCTIONS ======================
  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      if (type === "reservation") {
        const { error } = await supabase
          .from("reservations")
          .delete()
          .eq("reservations_id", id);
        
        if (error) throw error;
        
        setReservations(prev => prev.filter(r => r.reservations_id !== id));
      } else {
        const { error } = await supabase
          .from("booking_by_owner")
          .delete()
          .eq("booking_id", id);
        
        if (error) throw error;
        
        setBookingsByOwner(prev => prev.filter(b => b.booking_id !== id));
      }

      alert("Deleted successfully from server!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.message || "Unknown error"));
    }
  };

  // ====================== NAVIGATION ======================
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) return <p className="loading">Loading bookings...</p>;

  const isSearching = searchLoading;

  return (
    <div className="owner-details-page">
      {/* === NAVBAR === */}
      <nav className="navbar">
        <div className="navbar-left">
          <button onClick={() => navigate("/VenueOwnerPage", { state: { userId } })}>Profile</button>
          <button onClick={() => navigate("/visit-form", { state: { userId } })}>Visit Form</button>
          <button onClick={() => navigate("/search")}>Search</button>
          <button onClick={() => navigate("/add-booking", { state: { userId } })}>Add Booking</button>
          <button onClick={() => navigate("/booking-details", { state: { userId } })}>See Booking Details</button>
        </div>
        <div className="navbar-right">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="booking-details-container">
        <h2>Booking Details & Search</h2>

        {/* === SEARCH FORM === */}
        <div className="search-form-section">
          <h3>Search Bookings</h3>
          <div className="search-form">
            <div className="search-input-group">
              <label>Booking Date</label>
              <input
                type="date"
                name="bookingDate"
                value={searchParams.bookingDate}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            
            <div className="search-input-group">
              <label>User Name</label>
              <input
                type="text"
                name="userName"
                placeholder="Enter user name..."
                value={searchParams.userName}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            
            <div className="search-input-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="userPhone"
                placeholder="Enter phone number..."
                value={searchParams.userPhone}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            
            <div className="search-buttons">
              <button 
                onClick={handleSearch} 
                disabled={isSearching || !hasSearchParams}
                className="search-btn"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              <button 
                onClick={handleClearSearch} 
                disabled={isSearching}
                className="clear-btn"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>

        {/* === RESERVATIONS TABLE === */}
        <div className="table-section">
          <h3>
            Reservations ({reservations.length})
            <span className="table-subtitle"> - Shows all reservations from customers</span>
          </h3>
          
          {reservations.length === 0 ? (
            <p className="no-data">No reservations found</p>
          ) : (
            <div className="table-container">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Reservation ID</th>
                    <th>User ID</th>
                    <th>Reservation Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.reservations_id}>
                      <td>{r.reservations_id}</td>
                      <td>{r.user_id}</td>
                      <td>{r.reservation_date}</td>
                      <td>${r.price}</td>
                      <td>
                        <span className={`status-badge ${r.status ? 'active' : 'pending'}`}>
                          {r.status ? "Confirmed" : "Pending"}
                        </span>
                      </td>
                      <td className="description-cell">{r.description || "No description"}</td>
                      <td>{new Date(r.created_at || r.reservation_date).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick("reservation", r)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete("reservation", r.reservations_id)}
                          >
                            cancel reservations
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === BOOKINGS BY OWNER TABLE === */}
        <div className="table-section">
          <h3>
            Bookings by Owner ({bookingsByOwner.length})
            <span className="table-subtitle"> - Shows bookings you created directly</span>
          </h3>
          
          {bookingsByOwner.length === 0 ? (
            <p className="no-data">No bookings found</p>
          ) : (
            <div className="table-container">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Hall ID</th>
                    <th>User Name</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Date</th>
                    <th>Final Price</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsByOwner.map(b => (
                    <tr key={b.booking_id}>
                      <td>{b.booking_id}</td>
                      <td>{b.hall_id}</td>
                      <td>{b.user_name}</td>
                      <td>{b.user_phone}</td>
                      <td>{b.city}</td>
                      <td>{b.booking_date}</td>
                      <td>${b.final_price}</td>
                      <td className="description-cell">{b.description || "No description"}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick("booking", b)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete("booking", b.booking_id)}
                          >
                            cancel  reservations
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === SEARCH SUMMARY === */}
        {hasSearchParams && (
          <div className="search-summary">
            <p>
              <strong>Search Results:</strong> 
              Showing {reservations.length + bookingsByOwner.length} total bookings
              {searchParams.bookingDate && ` for date: ${searchParams.bookingDate}`}
              {searchParams.userName && ` with name containing: "${searchParams.userName}"`}
              {searchParams.userPhone && ` with phone containing: "${searchParams.userPhone}"`}
            </p>
          </div>
        )}
      </div>

      {/* === EDIT DIALOG === */}
      {showEditDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Edit {currentEditType === "reservation" ? "Reservation" : "Booking"}</h3>
            
            {currentEditType === "reservation" ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={editReservationData.price}
                    onChange={(e) => setEditReservationData(prev => ({
                      ...prev,
                      price: e.target.value
                    }))}
                    className="dialog-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editReservationData.status}
                    onChange={(e) => setEditReservationData(prev => ({
                      ...prev,
                      status: e.target.value === "true"
                    }))}
                    className="dialog-input"
                  >
                    <option value="true">Confirmed</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editReservationData.description || ""}
                    onChange={(e) => setEditReservationData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="dialog-input"
                    rows="3"
                  />
                </div>
              </div>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label>User Name</label>
                  <input
                    type="text"
                    value={editBookingData.user_name}
                    onChange={(e) => setEditBookingData(prev => ({
                      ...prev,
                      user_name: e.target.value
                    }))}
                    className="dialog-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editBookingData.user_phone}
                    onChange={(e) => setEditBookingData(prev => ({
                      ...prev,
                      user_phone: e.target.value
                    }))}
                    className="dialog-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={editBookingData.city}
                    onChange={(e) => setEditBookingData(prev => ({
                      ...prev,
                      city: e.target.value
                    }))}
                    className="dialog-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={editBookingData.final_price}
                    onChange={(e) => setEditBookingData(prev => ({
                      ...prev,
                      final_price: e.target.value
                    }))}
                    className="dialog-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Booking Date</label>
                  <input
                    type="date"
                    value={editBookingData.booking_date}
                    onChange={(e) => setEditBookingData(prev => ({
                      ...prev,
                      booking_date: e.target.value
                    }))}
                    className="dialog-input"
                  />
                </div>
              </div>
            )}
            
            <div className="dialog-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}