import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/Dj.css';
import { supabase } from "../supabaseClient";

export default function DJPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome! I\'m here to help you find the perfect DJ for your wedding celebration. How can I assist you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [djs, setDjs] = useState([]);
  const [loadingDjs, setLoadingDjs] = useState(true);

  const locations = ['all', ...Array.from(new Set(djs.map(d => d.location).filter(Boolean)))];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'low', label: 'Under 2,000 ₪' },
    { value: 'medium', label: '2,000 - 2,500 ₪' },
    { value: 'high', label: 'Over 2,500 ₪' }
  ];

  const filteredDJs = djs.filter(dj => {
    const matchesSearch = (dj.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dj.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dj.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = selectedLocation === 'all' || dj.location === selectedLocation;

    const matchesPrice = selectedPrice === 'all' ||
                        (selectedPrice === 'low' && (dj.price || 0) < 2000) ||
                        (selectedPrice === 'medium' && (dj.price || 0) >= 2000 && (dj.price || 0) <= 2500) ||
                        (selectedPrice === 'high' && (dj.price || 0) > 2500);

    return matchesSearch && matchesLocation && matchesPrice;
  });

  useEffect(() => {
    const fetchDJs = async () => {
      setLoadingDjs(true);
      try {
        // Fetch all owners with type DJ
        const { data: owners, error: ownersErr } = await supabase
          .from('owners')
          .select('owner_id, user_id, rate, description')
          .eq('owner_type', 'DJ');

        if (ownersErr) {
          console.error('Error fetching owners data:', ownersErr);
          setDjs([]);
          setLoadingDjs(false);
          return;
        }

        if (!owners || owners.length === 0) {
          console.log('No DJs found in database');
          setDjs([]);
          setLoadingDjs(false);
          return;
        }

        console.log('✅ Owners data:', owners);

        // Extract all user_ids from owners
        const userIds = Array.from(new Set(owners.map(o => o.user_id).filter(Boolean)));

        // Fetch user data and DJ data in parallel
        const [{ data: users }, { data: djEntries }] = await Promise.all([
          supabase.from('users').select('id, name, city').in('id', userIds),
          supabase.from('dj').select('id, user_id, imgurl, price').in('user_id', userIds)
        ]);

        console.log('✅ Users data:', users);
        console.log('✅ DJ entries data (with imgurl):', djEntries);

        // Convert data to objects for quick access
        const usersById = (users || []).reduce((acc, u) => { 
          acc[u.id] = u; 
          return acc; 
        }, {});
        
        const djByUser = (djEntries || []).reduce((acc, d) => { 
          acc[d.user_id] = d; 
          return acc; 
        }, {});

        // Helper to resolve image path (storage path) to a public URL
        const resolveImageUrl = async (imgPath) => {
          if (!imgPath) return '/img/djj1.jpg';
          if (imgPath.startsWith('http')) return imgPath;

          const bucketsToTry = ['dj', 'images', 'public', 'img'];
          const pathVariants = [
            imgPath,
            `img/${imgPath}`,
            `images/${imgPath}`,
            `public/${imgPath}`,
            `dj/${imgPath}`
          ];

          for (const bucket of bucketsToTry) {
            for (const variant of pathVariants) {
              try {
                const { data } = supabase.storage.from(bucket).getPublicUrl(variant);
                const publicUrl = data?.publicUrl || data?.public_url;
                if (!publicUrl) continue;

                // Verify the URL by attempting to load the image in the browser
                try {
                  const loaded = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    img.src = publicUrl;
                  });
                  if (loaded) return publicUrl;
                  console.warn(`Public URL check failed for bucket=${bucket}, variant=${variant}, url=${publicUrl}, image load failed`);
                } catch (fetchErr) {
                  console.warn(`Failed to verify image ${publicUrl}:`, fetchErr);
                }
              } catch (e) {
                // ignore and try next variant/bucket
              }
            }
          }

          return '/img/djj1.jpg';
        };

        // Merge data from three tables with async image path resolution
        const items = await Promise.all(owners.map(async owner => {
          const user = usersById[owner.user_id] || {};
          const djEntry = djByUser[owner.user_id] || {};
          const resolvedImage = await resolveImageUrl(djEntry.imgurl);

          console.log(`DJ ${user.name}: imgurl = ${djEntry.imgurl} -> resolved = ${resolvedImage}`);

          return {
            id: djEntry.id || owner.owner_id,
            name: user.name || 'DJ',
            location: user.city || 'Unknown',
            rating: Number(owner.rate) || 0,
            reviews: 0,
            description: owner.description || 'Professional DJ for your special day',
            image: resolvedImage,
            price: Number(djEntry.price) || 0,
            
          };
        }));

        console.log('✅ Final DJs array:', items);
        setDjs(items);
      } catch (err) {
        console.error('Error fetching DJs data:', err);
        setDjs([]);
      } finally {
        setLoadingDjs(false);
      }
    };

    fetchDJs();
  }, []);

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
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('سعر') || lowerMessage.includes('تكلفة')) {
      return 'Our DJ services range from 1,800 ₪ to 3,000 ₪ depending on experience and equipment. I can help you find a DJ that fits your budget. What price range are you considering?';
    } else if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('موقع') || lowerMessage.includes('مكان')) {
      return 'We have professional DJs available in Ramallah, Nablus, Bethlehem, and Hebron. Which location do you prefer for your wedding?';
    } else if (lowerMessage.includes('date') || lowerMessage.includes('available') || lowerMessage.includes('تاريخ') || lowerMessage.includes('متاح')) {
      return 'Our DJs have various available dates. You can use the date filter to check which DJs are available on your preferred date. When is your wedding date?';
    } else if (lowerMessage.includes('book') || lowerMessage.includes('reservation') || lowerMessage.includes('حجز') || lowerMessage.includes('احجز')) {
      return 'Excellent! To book a DJ consultation, please call us at 02-1234567 or you can leave your phone number and we will call you within 24 hours.';
    } else if (lowerMessage.includes('service') || lowerMessage.includes('equipment') || lowerMessage.includes('خدمة') || lowerMessage.includes('معدات')) {
      return 'All our DJs come with professional sound systems, lighting equipment, and microphones. Some also offer additional services like MC hosting and special effects. Would you like to know more about a specific DJ?';
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('شكر')) {
      return 'You\'re welcome! We\'re happy to serve you. Feel free to ask any other questions. We\'re here to make your wedding day perfect! 💍✨';
    } else {
      return 'Thank you for contacting us! I can help you with:\n• Information about prices and packages\n• DJ locations and availability\n• Booking a consultation\n• Equipment and services\n\nWhat would you like to know?';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
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
              <li className="nav-item"><a className="nav-link" href="/Venuespage">Venues</a></li>
              <li className="nav-item"><a className="nav-link" href="/DecorPage">Decoration</a></li>
              <li className="nav-item"><a className="nav-link active" href="/DJ">DJ</a></li>
              <li className="nav-item"><a className="nav-link" href="/CakePage">Cakes</a></li>
              <li className="nav-item"><a className="nav-link" href="/PhotographersPage">Photography</a></li>
              <li className="nav-item ms-3"><a className="btn btn-primary-custom" href="/login">Log in</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="dj-page">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="page-title">Professional Wedding DJs</h1>
            <p className="page-subtitle">Find the perfect DJ to create unforgettable moments at your celebration</p>
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
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by DJ name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>

              <div className="row">
                <div className="col-md-4">
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

                <div className="col-md-4">
                  <div className="filter-group">
                    <label className="filter-label">Price Range</label>
                    <select
                      className="filter-select"
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                    >
                      {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="filter-group">
                    <label className="filter-label">Available Date</label>
                    <input
                      type="date"
                      className="filter-date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loadingDjs ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading DJs...</p>
            </div>
          ) : filteredDJs.length > 0 ? (
            <div className="dj-grid">
              {filteredDJs.map((dj, index) => (
                <motion.div
                  key={dj.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="dj-card">
                    <div className="dj-image-wrapper">
                      <img 
                        src={dj.image} 
                        alt={dj.name} 
                        className="dj-image"
                        onError={(e) => {
                          e.target.src = '/images/DJ.jpg';
                        }}
                      />
                      {dj.rating >= 4.5 && (
                        <div className="dj-badge">Top Rated</div>
                      )}
                    </div>

                    <div className="dj-content">
                      <h3 className="dj-name">{dj.name}</h3>

                      <div className="dj-rating">
                        <span className="rating-stars">⭐</span>
                        <span className="rating-number">{(dj.rating || 0).toFixed(1)}</span>
                        <span className="rating-reviews">({dj.reviews} reviews)</span>
                      </div>

                      <p className="dj-description">{dj.description}</p>

                      <div className="dj-details">
                        <div className="dj-detail-item">
                          <div className="detail-icon">📍</div>
                          <div className="detail-label">Location</div>
                          <div className="detail-value">{dj.location}</div>
                        </div>
                      
                      </div>

                      <div className="dj-price">{(dj.price || 0).toLocaleString()} ₪</div>

                      <button className="btn-book">Visit Now</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No DJs found matching your search. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

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
                <span>AI DJ Assistant</span>
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