import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../style/VenueDetails.css";

export default function VenueDetails() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { userId } = useParams();
  const [commentsList, setCommentsList] = useState([]);
  const [hall, setHall] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [date, setDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userIdDb, setUserIdDb] = sessionStorage.getItem("userId_") || null;
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const [commentMsg, setCommentMsg] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
const [showVisitForm, setShowVisitForm] = useState(false);
const [visitDate, setVisitDate] = useState(null);
const [visitTime, setVisitTime] = useState("");
const [visitMessage, setVisitMessage] = useState("");

  function StarRating({ ownerId }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState("");

    const handleRating = async (selectedRate) => {
      const userId = sessionStorage.getItem("userId_");
      if (!userId) {
        setMessage(" You must be logged in to rate");
        return;
      }

      if (!ownerId) {
        setMessage(" Owner ID is missing");
        return;
      }

      const { data: ownerData, error: ownerError } = await supabase
        .from("owners")
        .select("rate, rating_count")
        .eq("owner_id", ownerId)
        .single();

      if (ownerError || !ownerData) {
        setMessage("⚠️ Error fetching owner data");
        return;
      }

      const currentRate = ownerData.rate || 0;
      const currentCount = ownerData.rating_count || 0;

      const newCount = currentCount + 1;
      const newRate = (currentRate * currentCount + selectedRate) / newCount;

      const { error: updateError } = await supabase
        .from("owners")
        .update({
          rate: newRate,
          rating_count: newCount,
        })
        .eq("owner_id", ownerId);

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      setRating(selectedRate);
      setMessage(`✅ Thank you! New rating: ${newRate.toFixed(1)} (${newCount} ratings)`);
    };

    return (
      <div className="star-rating-container">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={`star ${(hover || rating) >= star ? 'active' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        {message && <p className="rating-message">{message}</p>}
      </div>
    );
  }
const handleVisitSubmit = async (e) => {
  e.preventDefault();

  if (!userIdDb) {
    setVisitMessage("⚠️ User not found");
    return;
  }

  if (!visitDate || !visitTime) {
    setVisitMessage("⚠️ Please select date and time");
    return;
  }

  const { error } = await supabase
    .from("visit")
    .insert([
      {
        user_id: sessionStorage.getItem("userId_"),
        owner_id: userId,
        visit_date: visitDate.toISOString().split("T")[0],
        visit_time: visitTime,
        accept: false
      }
    ]);

  if (error) {
    setVisitMessage(error.message);
  } else {
    setVisitMessage("✅ Visit scheduled successfully!");
    alert("Your visit request has been submitted successfully , waiting for approval.");
    setVisitDate(null);
    setVisitTime("");
    setShowVisitForm(false);
  }
};

  useEffect(() => {
    const fetchHall = async () => {
      const { data, error } = await supabase
        .from("hall")
        .select(`
          *,
          owners:owner_id (
            description,
            users:user_id (city)
          )
        `)
        .eq("owner_id", userId)
        .single();

      if (!error) setHall(data);
    };

    const currentEmail = sessionStorage.getItem("currentEmail");
    if (currentEmail) {
      setEmail(currentEmail);

      const fetchUserData = async () => {
        const { data } = await supabase
          .from("users")
          .select("id, name, phone")
          .eq("email", currentEmail)
          .single();

        if (data) {
          setUserIdDb(data.id);
          setName(data.name);
          setPhone(data.phone);
        }
      };
      fetchUserData();
    }

    fetchHall();
  }, [userId]);

  const handleAddComment = async () => {
    const userIdFromSession = sessionStorage.getItem("userId_");

    if (!comment.trim()) {
      setCommentMsg("⚠️ Please write a comment first");
      return;
    }

    if (!userIdFromSession) {
      setCommentMsg(" You must be logged in");
      return;
    }

    const { data: reservations, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", userIdFromSession)
      .eq("owner_id", userId)
      .eq("status", true) 
      .limit(1);          

    if (reservationError) {
      setCommentMsg(reservationError.message);
      return;
    }

   

    const { error } = await supabase
      .from("comments")
      .insert([
        {
          user_id: userIdFromSession,
          owner_id: userId,
          description: comment
        }
      ]);

    if (error) {
      setCommentMsg(error.message);
    } else {
      setCommentMsg("✅ Comment added successfully");
      setComment("");
      fetchComments();
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users:user_id (name)
      `)
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCommentsList(data);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [userId]);
// دالة لتحميل بيانات المستخدم
const fetchUserDataFromSession = async () => {
  const userIdFromSession = sessionStorage.getItem("userId_");
  if (!userIdFromSession) return;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone")
    .eq("id", userIdFromSession)
    .single();

  if (!error && data) {
    setUserIdDb(data.id);
    setName(data.name);
    setEmail(data.email);
    setPhone(data.phone);
  }
};

// نستخدم useEffect لمراقبة showBookingForm
useEffect(() => {
  if (showBookingForm) {
    fetchUserDataFromSession();
  }
}, [showBookingForm]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!hall) return;
      const { data, error } = await supabase
        .from("reservations")
        .select("reservation_date")
        .eq("owner_id", hall.owner_id)
        .eq("status", true);

      if (!error && data) {
        const dates = data.map((r) => new Date(r.reservation_date));
        setBookedDates(dates);
      }
    };

    fetchBookedDates();
  }, [hall]);

  if (!hall) return <p>Loading...</p>;

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!bookingDate) {
      setMessage("⚠️ Please select a booking date");
      return;
    }

    if (!userIdDb) {
      setMessage("⚠️ User not found");
      return;
    }

    const { error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id: userIdDb,
          owner_id: userId,
          reservation_date: bookingDate.toISOString().split("T")[0],
          price: hall.price,
          status: true,
          describtion: `Booking for ${hall.hall_type}`
        }
      ]);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Reservation saved successfully!");
      setBookingDate(null);
      setBookedDates([...bookedDates, new Date(bookingDate)]);
      setShowBookingForm(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const booked = bookedDates.find(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );
      if (booked) return "booked-date";
    }
  };

  return (
    <div className="venue-container">
      {/* IMAGE AND DETAILS SECTION */}
      <div className="venue-header">
        <div className="venue-image-section">
         <div className="venue-image">
  {hall.imgurl
    ? hall.imgurl.split(",").map((img, index) => (
        <img
          key={index}
          src={`/img/hall/${img.trim()}`}
          alt={`${hall.hall_type} ${index + 1}`}
        />
      ))
    : <img src="/images/Venue.jpg" alt={hall.hall_type} />}
</div>

          
          {/* RATING SECTION UNDER IMAGE - SMALLER SIZE */}
          <div className="venue-rating">
            <span className="rate-label">
              <span className="btn-icon">✨</span>
              <span className="btn-text">Rate this hall</span>
            </span>
            {hall && <StarRating ownerId={userId} />}
          </div>
        </div>

        <div className="venue-details">
          <h2>{hall.hall_type}</h2>
          <p className="description">{hall.owners?.description}</p>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">📍 Location</span>
              <span className="detail-value">{hall.owners?.users?.city}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💰 Price</span>
              <span className="detail-value">{hall.price} ₪</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">👩 Women Capacity</span>
              <span className="detail-value">{hall.women_capacity}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">👨 Men Capacity</span>
              <span className="detail-value">{hall.men_capacity}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">👥 Total Capacity</span>
              <span className="detail-value">{hall.men_capacity + hall.women_capacity}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🚗 Parking</span>
              <span className="detail-value">{hall.parking ? "Available" : "Not Available"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="venue-comments">
        <h3>💬 Comments</h3>
 <div className="add-comment" style={{ position: "relative", width: "100%" }}>
  <textarea
    placeholder="Write your comment here..."
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddComment();
      }
    }}
    style={{
      width: "100%",
      paddingRight: "50px", 
      minHeight: "60px",
      borderRadius: "8px",
      padding: "10px",
      fontSize: "14px",
    }}
  />
  <span
    onClick={handleAddComment}
    style={{
      position: "absolute",
      right: "40px",
      top: "45px", 
      cursor: "pointer",
      fontSize: "20px",
      color: "#d4a574",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) => {
      e.target.style.color = "#8b5a2b";
      e.target.style.transform = "scale(1.2)";
    }}
    onMouseLeave={(e) => {
      e.target.style.color = "#d4a574";
      e.target.style.transform = "scale(1)";
    }}
  >
    ➤
  </span>

  {commentMsg && <p className="comment-message">{commentMsg}</p>}
</div>
        <div className="comments-list">
          {commentsList.length === 0 ? (
            <p className="no-comments">No comments yet</p>
          ) : (
            <div className="comments-grid">
              {commentsList.map((c) => (
                <div key={c.comment_id} className="single-comment">
                  <div className="comment-header">
                    <strong>{c.users?.name || "Anonymous"}</strong>
                    <em>{new Date(c.created_at).toLocaleDateString()}</em>
                  </div>
                  <p className="comment-text">{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
<div className="venue-calendar">
  <div className="calendar-left">
    <div>
      <h3>📅 Availability Calendar</h3>
      <p className="calendar-note">Red dates indicate booked dates</p>
    </div>

    {/* container خاص للأزرار */}
    <div className="calendar-buttons">
      <button 
        className="btn-book" 
        onClick={() => setShowBookingForm(true)}
      >
        <span className="btn-icon">✨</span>
        <span className="btn-text">Book Now</span>
      </button>

      <button
  className="btn-visit"
  onClick={() => setShowVisitForm(true)}
>
  <span className="btn-icon">✨</span>
  <span className="btn-text">Visit Now</span>
</button>

    </div>
  </div>

  <div className="calendar-right">
    <Calendar
      onChange={setDate}
      value={date}
      minDate={new Date()}
      tileClassName={tileClassName}
    />
  </div>
</div>


      {/* BOOKING FORM - CALENDAR LEFT, FORM RIGHT */}
      {showBookingForm && (
        <div className="venue-booking-form">
          <div className="booking-form-header">
            <h3>📝 Book this hall</h3>
            <button 
              className="btn-close" 
              onClick={() => setShowBookingForm(false)}
            >
              ✕
            </button>
          </div>

          <div className="booking-form-content">
            {/* CALENDAR ON LEFT */}
            <div className="booking-calendar">
              <h4>Choose booking date</h4>
              <Calendar
                onChange={setBookingDate}
                value={bookingDate}
                minDate={new Date()}
                tileClassName={tileClassName}
              />
              {bookingDate && (
                <p className="selected-date">Selected date: {bookingDate.toDateString()}</p>
              )}
            </div>

            {/* FORM ON RIGHT */}
            <div className="booking-form-fields">
              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={name} readOnly
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>city:</label>
                  <input type="email" value={email} readOnly />
                </div>

                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={phone} readOnly
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

               

                <button type="submit" className="btn-submit">Confirm Booking</button>

                {message && <p className="booking-message">{message}</p>}
              </form>
            </div>
          </div>
        </div>
      )}

      {showVisitForm && (
  <div className="venue-visit-form">
    <div className="visit-form-header">
      <h3>📝 Schedule a Visit</h3>
      <button className="btn-close" onClick={() => setShowVisitForm(false)}>✕</button>
    </div>

    <div className="visit-form-content">
      <form onSubmit={handleVisitSubmit}>
        <div className="form-group">
          <label>Visit Date:</label>
          <input
            type="date"
            value={visitDate ? visitDate.toISOString().split("T")[0] : ""}
            onChange={(e) => setVisitDate(new Date(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label>Visit Time:</label>
          <input
            type="time"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-submit">Confirm Visit</button>
        {visitMessage && <p className="visit-message">{visitMessage}</p>}
      </form>
    </div>
  </div>
)}

    </div>
  );
}