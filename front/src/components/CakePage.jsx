import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/CakePage.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from "react-router-dom";

export default function CakesPage() {



  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const [cakeShops, setCakeShops] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedCake, setSelectedCake] = useState(null);
const [visitDate, setVisitDate] = useState("");
const [visitTime, setVisitTime] = useState("");

  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome! I\'m here to help you find the perfect cake shop for your wedding celebration. How can I assist you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
const [showVisitForm, setShowVisitForm] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);
useEffect(() => {
  const fetchData = async () => {

    const { data: owners, error: ownersError } = await supabase
      .from("owners")
      .select("owner_id, user_id")
      .eq("owner_type", "cake")
      .eq("accept", true)
      .eq("visible", true);

    if (ownersError || !owners?.length) {
      console.error(ownersError);
      setLoading(false);
      return;
    }

    const userIds = owners.map(o => o.user_id);

    const { data: cakes, error: cakesError } = await supabase
      .from("cakes")
      .select(`
        id,
        user_id,
        imgurl,
        users ( name, city )
      `)
      .in("user_id", userIds);

    if (cakesError) {
      console.error(cakesError);
      setLoading(false);
      return;
    }
    const shops = cakes.map(cake => {
      const owner = owners.find(o => o.user_id === cake.user_id);

      return {
        cake_id: cake.id,
        owner_id: owner?.owner_id,        
        owner_user_id: cake.user_id,
        name: cake.users?.name,
     image: `/img/cake/${cake.imgurl}`,
        location: cake.users?.city
      };
    });

    setCakeShops(shops);
    setLoading(false);
  };

  fetchData();
}, []);
const handleConfirmVisit = async () => {
  if (!visitDate || !visitTime) {
    alert("Choose date & time");
    return;
  }

  if (!selectedCake?.owner_id) {
    alert("Owner not found");
    return;
  }

  const { error } = await supabase
    .from("visit")
    .insert({
      user_id: Number(sessionStorage.getItem("userId_")), 
      owner_id: selectedCake.owner_id,                   
      visit_date: visitDate,
      visit_time: visitTime
    });

  if (error) {
    console.error(error);
    alert(error.message);
  } else {
    alert("Visit booked successfully 🎉");
    setVisitDate("");
    setVisitTime("");
    setSelectedCake(null);
  }
};




  const locations = ['all', 'Ramallah', 'Nablus', 'Bethlehem', 'Hebron', 'Jerusalem', 'Jenin', 'Tulkarm', 'Qalqilya', 'Salfit', 'Tubas', 'Jericho'];

  const filteredCakeShops = cakeShops.filter(shop => {
    const matchesSearch = (shop.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (shop.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || shop.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage = { type: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 1000);
  };

  const generateBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return 'We have excellent cake shops in Ramallah, Nablus, Bethlehem, and Hebron. Which location would you prefer to visit?';
    } else if (lowerMessage.includes('visit') || lowerMessage.includes('appointment')) {
      return 'Great! To schedule a visit to any cake shop, please call us at 02-1234567 or you can leave your phone number and we will arrange a visit appointment for you.';
    } else if (lowerMessage.includes('specialty') || lowerMessage.includes('design')) {
      return 'Each of our partner cake shops specializes in different styles - from traditional multi-tier cakes to modern artistic designs. Would you like to know more about a specific shop?';
    } else if (lowerMessage.includes('custom') || lowerMessage.includes('personalized')) {
      return 'All our cake shops offer custom designs tailored to your wedding theme and preferences. You can discuss your vision during your visit appointment.';
    } else if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Happy to serve you. Don\'t hesitate to ask any other questions. We\'re here to make your wedding day perfect! 💍✨';
    } else {
      return 'Thank you for contacting us! I can help you with:\n• Finding cake shops by location\n• Information about specialties\n• Scheduling visit appointments\n• Custom design options\n\nWhat would you like to know?';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    if (!document.querySelector('link[href*="Playfair+Display"]')) {
      document.head.appendChild(fontLink);
    }

    const handleScroll = () => {
      const navbar = document.querySelector('.wps-navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light wps-navbar">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                color: 'var(--white)',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              WPS
            </motion.div>
            <span className="brand-primary">Wedding Planning System</span>
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
      <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
              <li className="nav-item"><a className="nav-link " href="/Venuespage">Venues</a></li>
              <li className="nav-item"><a className="nav-link" href="/DecorPage">Decoration</a></li>
              <li className="nav-item"><a className="nav-link" href="/DJ">DJ</a></li>
              <li className="nav-item"><a className="nav-link" href="/CakePage">Cakes</a></li>
              <li className="nav-item"><a className="nav-link" href="/PhotographersPage">Photography</a></li>
              <li className="nav-item ms-3"><a className="btn btn-primary-custom" href="/login">Log in</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="cakes-page">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="page-title">Wedding Cake Shops</h1>
            <p className="page-subtitle">Discover the finest cake shops for your special celebration</p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            className="search-filter-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="container">
              <div className="search-box">
                
              </div>

              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="filter-group">
                    <label className="filter-label">Location</label>
                    <select
                      className="filter-select"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="all">All Locations</option>
                      {locations.slice(1).map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
          </motion.div>

          {/* Cake Shops Grid */}
          {loading ? (
            <div className="text-center my-5">Loading cake shops...</div>
          ) : filteredCakeShops.length > 0 ? (
            <div className="cakes-grid">
              {filteredCakeShops.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="cake-card">
                    <div className="cake-image-wrapper">
                      <img src={shop.image} alt={shop.name} className="cake-image" />
                    </div>

                    <div className="cake-content">
                      <h3 className="cake-name">{shop.name}</h3>

                      <div className="cake-location">
                        <span className="location-icon">📍</span>
                        <span>{shop.location}</span>
                      </div>
<button
  className="btn btn-primary"
  onClick={() => {
    setSelectedCake(shop);
    setShowVisitForm(true);
  }}
>
  Visit now
</button>


                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No cake shops found matching your search. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
{showVisitForm && selectedCake && (
  <div className="visit-modal-overlay">
    <div className="visit-modal">
      <h4>Book a Visit</h4>

   

      <p>
        🏪 <strong>shope Name that you want to visit :</strong> {selectedCake.name}
      </p>

      <div className="mb-3">
        <label>Date</label>
        <input
          type="date"
          className="form-control"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Time</label>
        <input
          type="time"
          className="form-control"
          value={visitTime}
          onChange={(e) => setVisitTime(e.target.value)}
        />
      </div>

      <div className="d-flex gap-2">
      <button
  className="btn btn-success"
  onClick={handleConfirmVisit}
>
  Confirm Visit
</button>


        <button
          className="btn btn-secondary"
          onClick={() => setShowVisitForm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="brand-primary" style={{fontSize: '1.6rem', marginBottom: '1rem'}}>Wedding Planning System</div>
              <p style={{color: '#c9c5c0', fontFamily: 'Lato, sans-serif'}}>Your trusted partner in orchestrating extraordinary Palestinian wedding celebrations with unparalleled elegance and sophistication.</p>
            </div>
            <div className="col-lg-2 col-md-4 mb-4">
              <h5 className="footer-heading">Company</h5>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4 mb-4">
              <h5 className="footer-heading">Support</h5>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4 mb-4">
              <h5 className="footer-heading">Vendors</h5>
              <ul className="footer-links">
                <li><a href="#">List Your Venue</a></li>
                <li><a href="#">Join as Vendor</a></li>
                <li><a href="#">Vendor Resources</a></li>
              </ul>
            </div>
            <div className="col-lg-2 mb-4">
              <h5 className="footer-heading">Connect</h5>
              <ul className="footer-links">
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Wedding Planning System. All rights reserved. Crafted with excellence.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <div className="chatbot-container">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              className="chatbot-window"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="chatbot-header">
                <span>AI Cake Shop Assistant</span>
                <button className="chatbot-close" onClick={() => setChatOpen(false)}>×</button>
              </div>

              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message message-${msg.type}`}>
                    <div className="message-bubble">{msg.text}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chatbot-input-area">
                <input
                  type="text"
                  className="chatbot-input"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="chatbot-send" onClick={handleSendMessage}>
                  ➤
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="chatbot-toggle" onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}