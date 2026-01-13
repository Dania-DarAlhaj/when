import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogout = () => {
  sessionStorage.clear(); // أو removeItem("email")
  setIsLoggedIn(false);
  navigate("/login");
};

  useEffect(() => {
     setIsLoggedIn(!!sessionStorage.getItem("currentEmail"));
     
    const css = `
    :root{ 
      --primary: #8B7355;
      --secondary: #C9A882;
      --accent: #F5E6D3;
      --light: #FAF8F5;
      --white: #ffffff;
      --dark: #2C2416;
      --text: #3D3427;
      --text-light: #8B7E6F;
      --gold: #D4AF37;
      --gold-light: #F4E4C1;
    }
    
    body {
      background: var(--white);
      color: var(--text);
      font-family: 'Playfair Display', 'Georgia', serif;
      line-height: 1.7;
      overflow-x: hidden;
    }
    
    * {
      box-sizing: border-box;
    }
    
    /* Luxury Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
    }
    
    ::-webkit-scrollbar-track {
      background: var(--light);
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--gold) 0%, var(--primary) 100%);
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, var(--primary) 0%, var(--dark) 100%);
    }
    
    /* Navbar */
    .wps-navbar {
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
      padding: 1.2rem 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }
    
    .navbar-scrolled {
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
      padding: 0.8rem 0;
      background: rgba(255, 255, 255, 0.98) !important;
    }
    
    .brand-primary {
      color: var(--dark);
      font-weight: 700;
      font-size: 1.6rem;
      letter-spacing: 1px;
      font-family: 'Playfair Display', serif;
      text-transform: uppercase;
    }
    
    .nav-link {
      color: var(--text) !important;
      font-weight: 500;
      margin: 0 1rem;
      position: relative;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      font-family: 'Lato', sans-serif;
      letter-spacing: 0.5px;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -5px;
      left: 50%;
      background: linear-gradient(90deg, var(--gold) 0%, var(--primary) 100%);
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }
    
    .nav-link:hover::before,
    .nav-link.active::before {
      width: 100%;
    }
    
    .nav-link:hover {
      color: var(--primary) !important;
    }
    
    .nav-link.active {
      color: var(--primary) !important;
    }

    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #FAF8F5 0%, #F5E6D3 50%, #E8D5C4 100%);
      position: relative;
      overflow: hidden;
      padding-top: 80px;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 20s ease-in-out infinite;
    }
    
    .hero::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(139, 115, 85, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 15s ease-in-out infinite reverse;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, -30px) scale(1.1); }
    }
    
    .hero-content {
      position: relative;
      z-index: 2;
    }
    
    .hero h1 {
      font-size: 4rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 1.5rem;
      line-height: 1.2;
      font-family: 'Playfair Display', serif;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .hero h1::after {
      content: '';
      display: block;
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, var(--gold) 0%, transparent 100%);
      margin-top: 1.5rem;
    }
    
    .hero p {
      color: var(--text);
      font-size: 1.3rem;
      margin-bottom: 2.5rem;
      max-width: 600px;
      font-family: 'Lato', sans-serif;
      line-height: 1.8;
    }
    
    .btn-primary-custom {
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      border: none;
      color: var(--white);
      font-weight: 600;
      padding: 1rem 3rem;
      border-radius: 50px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
      font-family: 'Lato', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.9rem;
      position: relative;
      overflow: hidden;
    }
    
    .btn-primary-custom::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
    }
    
    .btn-primary-custom:hover::before {
      left: 100%;
    }
    
    .btn-primary-custom:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(212, 175, 55, 0.4);
      background: linear-gradient(135deg, var(--primary) 0%, var(--dark) 100%);
      color: var(--white);
    }
    
    .btn-outline-custom {
      border: 2px solid var(--gold);
      color: var(--dark);
      background: transparent;
      font-weight: 600;
      padding: 1rem 3rem;
      border-radius: 50px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'Lato', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.9rem;
      position: relative;
      overflow: hidden;
    }
    
    .btn-outline-custom::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.5s, height 0.5s;
      z-index: -1;
    }
    
    .btn-outline-custom:hover::before {
      width: 300px;
      height: 300px;
    }
    
    .btn-outline-custom:hover {
      color: var(--white);
      border-color: var(--primary);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
    }
    
    .hero-image-wrapper {
      position: relative;
      z-index: 2;
    }
    
    .hero-image-wrapper::before {
      content: '';
      position: absolute;
      top: -20px;
      left: -20px;
      width: 100%;
      height: 100%;
      border: 3px solid var(--gold);
      border-radius: 12px;
      z-index: -1;
    }
    
    .hero-image-wrapper img {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
      transition: transform 0.5s ease;
    }
    
    .hero-image-wrapper:hover img {
      transform: scale(1.02);
    }

    /* Stats Section */
    .stats {
      background: var(--white);
      padding: 5rem 0;
      position: relative;
    }
    
    .stats::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%);
    }
    
    .stat-card {
      padding: 2rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--gold) 0%, var(--primary) 100%);
      transition: width 0.3s ease;
    }
    
    .stat-card:hover::before {
      width: 80%;
    }
    
    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
      font-family: 'Playfair Display', serif;
    }
    
    .stat-label {
      color: var(--text-light);
      font-weight: 500;
      font-family: 'Lato', sans-serif;
      letter-spacing: 0.5px;
    }

    /* Services Section */
    .services {
      background: linear-gradient(180deg, var(--light) 0%, var(--accent) 100%);
      padding: 6rem 0;
      position: relative;
    }
    
    .section-title {
      font-size: 3rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 1rem;
      text-align: center;
      font-family: 'Playfair Display', serif;
      position: relative;
      display: inline-block;
      width: 100%;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(90deg, var(--gold) 0%, var(--primary) 100%);
    }
    
    .section-subtitle {
      color: var(--text-light);
      text-align: center;
      margin-bottom: 4rem;
      font-size: 1.2rem;
      font-family: 'Lato', sans-serif;
    }
    
    .service-card {
      background: var(--white);
      border-radius: 16px;
      padding: 3rem 2.5rem;
      text-align: center;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    
    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--gold-light) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    .service-card:hover::before {
      opacity: 1;
    }
    
    .service-card:hover {
      transform: translateY(-15px);
      box-shadow: 0 20px 50px rgba(212, 175, 55, 0.2);
      border-color: var(--gold);
    }
    
    .service-icon {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, var(--gold-light) 0%, var(--accent) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      font-size: 2.5rem;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 1;
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.2);
    }
    
    .service-card:hover .service-icon {
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      transform: scale(1.15) rotate(10deg);
      box-shadow: 0 12px 30px rgba(212, 175, 55, 0.3);
    }
    
    .service-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--dark);
      margin-bottom: 1rem;
      font-family: 'Playfair Display', serif;
      position: relative;
      z-index: 1;
    }
    
    .service-desc {
      color: var(--text-light);
      line-height: 1.7;
      font-family: 'Lato', sans-serif;
      position: relative;
      z-index: 1;
    }

    /* Packages Section */
    .packages {
      background: var(--white);
      padding: 6rem 0;
      position: relative;
    }
    
    .packages::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 115, 85, 0.03) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .package-card {
      background: var(--white);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      height: 100%;
      position: relative;
    }
    
    .package-card::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      border-radius: 20px;
      opacity: 0;
      transition: opacity 0.5s ease;
      z-index: -1;
    }
    
    .package-card:hover::before {
      opacity: 1;
    }
    
    .package-card:hover {
      transform: translateY(-15px) scale(1.02);
      box-shadow: 0 25px 60px rgba(212, 175, 55, 0.25);
    }
    
    .package-header {
      background: linear-gradient(135deg, var(--gold-light) 0%, var(--accent) 100%);
      padding: 3rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .package-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(10%, 10%); }
    }
    
    .package-name {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 1rem;
      font-family: 'Playfair Display', serif;
      position: relative;
      z-index: 1;
    }
    
    .package-price {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-family: 'Playfair Display', serif;
      position: relative;
      z-index: 1;
    }
    
    .package-features {
      padding: 2.5rem;
    }
    
    .package-features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .package-features li {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
      position: relative;
      padding-left: 2rem;
      font-family: 'Lato', sans-serif;
      transition: all 0.3s ease;
    }
    
    .package-features li:hover {
      padding-left: 2.5rem;
      color: var(--primary);
    }
    
    .package-features li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--gold);
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    .package-features li:last-child {
      border-bottom: none;
    }
    
    .package-note {
      background: linear-gradient(135deg, var(--gold-light) 0%, var(--light) 100%);
      padding: 1.2rem;
      border-radius: 12px;
      margin-top: 1.5rem;
      font-style: italic;
      color: var(--text);
      font-family: 'Lato', sans-serif;
      border-left: 3px solid var(--gold);
    }

    /* How It Works */
    .how-it-works {
      background: linear-gradient(180deg, var(--accent) 0%, var(--light) 100%);
      padding: 6rem 0;
      position: relative;
    }
    
    .step-card {
      text-align: center;
      padding: 2rem;
      position: relative;
    }
    
    .step-card::after {
      content: '→';
      position: absolute;
      top: 50%;
      right: -20px;
      transform: translateY(-50%);
      font-size: 2rem;
      color: var(--gold);
      opacity: 0.3;
    }
    
    .step-card:last-child::after {
      display: none;
    }
    
    .step-number {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%);
      color: var(--white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin: 0 auto 1.5rem;
      font-size: 1.8rem;
      font-family: 'Playfair Display', serif;
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
      transition: all 0.4s ease;
      position: relative;
    }
    
    .step-number::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid var(--gold);
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0; }
    }
    
    .step-card:hover .step-number {
      transform: scale(1.1) rotate(10deg);
      box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
    }
    
    .step-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--dark);
      margin-bottom: 1rem;
      font-family: 'Playfair Display', serif;
    }

    /* Testimonials */
    .testimonials {
      background: var(--white);
      padding: 6rem 0;
      position: relative;
    }
    
    .testimonial-card {
      background: linear-gradient(135deg, var(--light) 0%, var(--white) 100%);
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      margin: 1rem;
      transition: all 0.4s ease;
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }
    
    .testimonial-card::before {
      content: '"';
      position: absolute;
      top: 20px;
      left: 20px;
      font-size: 6rem;
      color: var(--gold);
      opacity: 0.1;
      font-family: 'Playfair Display', serif;
      line-height: 1;
    }
    
    .testimonial-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 50px rgba(212, 175, 55, 0.2);
      border-color: var(--gold);
    }
    
    .testimonial-text {
      font-style: italic;
      color: var(--text);
      margin-bottom: 2rem;
      line-height: 1.8;
      font-family: 'Lato', sans-serif;
      font-size: 1.1rem;
      position: relative;
      z-index: 1;
    }
    
    .testimonial-author {
      font-weight: 600;
      color: var(--dark);
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      position: relative;
      padding-left: 20px;
    }
    
    .testimonial-author::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--gold) 0%, var(--primary) 100%);
    }

    /* Footer */
    footer {
      background: linear-gradient(135deg, var(--dark) 0%, #1a1410 100%);
      color: var(--white);
      padding: 5rem 0 2rem;
      position: relative;
      overflow: hidden;
    }
    
    footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--gold) 50%, transparent 100%);
    }
    
    .footer-heading {
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
      font-family: 'Playfair Display', serif;
      letter-spacing: 1px;
    }
    
    .footer-links {
      list-style: none;
      padding: 0;
    }
    
    .footer-links li {
      margin-bottom: 0.8rem;
    }
    
    .footer-links a {
      color: #c9c5c0;
      text-decoration: none;
      transition: all 0.3s ease;
      font-family: 'Lato', sans-serif;
      position: relative;
      display: inline-block;
    }
    
    .footer-links a::after {
      content: '';
      position: absolute;
      width: 0;
      height: 1px;
      bottom: -2px;
      left: 0;
      background: var(--gold);
      transition: width 0.3s ease;
    }
    
    .footer-links a:hover::after {
      width: 100%;
    }
    
    .footer-links a:hover {
      color: var(--gold);
      padding-left: 5px;
    }
    
    .footer-bottom {
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      padding-top: 2rem;
      margin-top: 3rem;
      text-align: center;
      color: #c9c5c0;
      font-family: 'Lato', sans-serif;
    }
    
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2.5rem;
      }
      
      .hero p {
        font-size: 1.1rem;
      }
      
      .section-title {
        font-size: 2rem;
      }
      
      .stat-number {
        font-size: 2rem;
      }
      
      .step-card::after {
        display: none;
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    `;

    const style = document.createElement('style');
   

    style.id = 'wps-homepage-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const handleScroll = () => {
      const navbar = document.querySelector('.wps-navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
      
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      const el = document.getElementById('wps-homepage-styles');
      if (el) el.remove();
      window.removeEventListener('scroll', handleScroll);
      
    };
  }, []);
const navigate = useNavigate();


  const services = [

      { 
    title: 'Wedding Venues', 
    desc: 'Discover exquisite halls with premium amenities and breathtaking ambiance for your perfect celebration.', 
    icon: '🏛️',
    path: '/VenuesPage'
  },
    { title: 'Music & Entertainment',
       desc: 'World-class DJs and live orchestras to create unforgettable musical experiences.', 
       icon: '🎧' ,
      path: '/DJ' },
    { title: 'Photography & Videography',
       desc: 'Award-winning photographers capturing every precious moment with artistic excellence.',
        icon: '📸' ,
        path: '/PhotographersPage'
      },
    { title: 'Luxury Cakes',
       desc: 'Bespoke wedding cakes crafted by master pastry chefs with premium ingredients.',
        icon: '🍰' ,
       path: '/CakePage'},
    { title: 'Floral Design',
       desc: 'Stunning floral arrangements and sophisticated venue styling by expert designers.',
        icon: '🌹',
        path: '/DecorPage' },
  ];

  const packages = [
    { 
      name: 'Essential Elegance', 
      price: '5,000 ₪', 
      items: [
        'Premium venue for up to 100 guests',
        'Professional DJ with sound system',
        '4 hours of professional photography',
        'Elegant floral decoration',
        'Premium lighting setup'
      ], 
      note: 'Perfect for intimate luxury celebrations' 
    },
    { 
      name: 'Royal Premium', 
      price: '8,500 ₪', 
      items: [
        'Luxury venue for 150 guests',
        'Elite DJ with advanced lighting',
        '6 hours photography + premium album',
        'Designer decoration package',
        'Gourmet catering experience'
      ], 
      note: 'Our most sought-after collection' 
    },
    { 
      name: 'Imperial Luxury', 
      price: '12,000 ₪', 
      items: [
        'Grand ballroom for 200+ guests',
        'Live orchestra & premium DJ',
        'Full day photography + cinematic videography',
        'Haute couture floral design',
        'Five-star catering & champagne service'
      ], 
      note: 'The pinnacle of wedding excellence' 
    },
  ];

  const steps = [
    { number: '1', title: 'Discover & Explore', desc: 'Browse our curated collection of premium venues and elite vendors' },
    { number: '2', title: 'Customize Your Vision', desc: 'Tailor every detail to match your unique wedding dreams' },
    { number: '3', title: 'Secure Your Date', desc: 'Reserve your perfect day with seamless booking experience' },
    { number: '4', title: 'Celebrate in Luxury', desc: 'Experience your dream wedding brought to life flawlessly' }
  ];

  const testimonials = [
    { text: 'WPS transformed our wedding into a fairytale. Every detail was executed with perfection and elegance beyond our expectations.', author: 'Sarah & Ahmed' },
    { text: 'The luxury and attention to detail was extraordinary. Our guests are still talking about how magnificent everything was!', author: 'Layla & Omar' },
    { text: 'From venue to vendors, everything was world-class. WPS made our dream wedding a stunning reality.', author: 'Nour & Khalid' }
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light wps-navbar fixed-top">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
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
              <li className="nav-item"><a className="nav-link active" href="#home">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#packages">Packages</a></li>
              <li className="nav-item"><a className="nav-link" href="#how-it-works">How It Works</a></li>
              <li className="nav-item"><a className="nav-link" href="#testimonials">Reviews</a></li>
          
              {/* زر Login / Logout */}
              <li className="nav-item">
                <button
                  className="btn btn-primary-custom"
                  onClick={isLoggedIn ? handleLogout : () => navigate("/login")}
                >
                  {isLoggedIn ? "Logout" : "Log in"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="home" className="hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 hero-content">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                Plan Your Perfect Palestinian Wedding
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                Experience luxury wedding planning with our curated collection of premium venues, elite vendors, and bespoke services — all orchestrated to perfection.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="d-flex gap-3 flex-wrap"
              >
                <a className="btn btn-primary-custom" href="#packages">Explore Packages</a>
                <a className="btn btn-outline-custom" href="#how-it-works">How It Works</a>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                className="hero-image-wrapper"
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              >
                <img
                  src="/1.jpg"
                  alt="Elegant wedding celebration"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="row text-center">
            {[
              { number: '500+', label: 'Premium Venues' },
              { number: '2,000+', label: 'Happy Couples' },
              { number: '50+', label: 'Cities Covered' },
              { number: '4.9/5', label: 'Excellence Rating' }
            ].map((stat, index) => (
              <div key={index} className="col-md-3 col-6 mb-4">
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="services">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Luxury Wedding Services
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From exquisite venues to world-class entertainment, we orchestrate every detail
          </motion.p>
          
          <div className="row g-4">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="col-md-4"
              >
                <div
  className="service-card"
  style={{ cursor: service.path ? 'pointer' : 'default' }}
  onClick={() => {
    if (service.path) {
      navigate(service.path);
    }
  }}
>

                  <div className="service-icon">{service.icon}</div>
                  <h4 className="service-title">{service.title}</h4>
                  <p className="service-desc">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="packages">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Bespoke Wedding Collections
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Meticulously curated packages designed for discerning couples
          </motion.p>
          
          <div className="row g-4">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="col-lg-4 col-md-6"
              >
                <div className="package-card">
                  <div className="package-header">
                    <h4 className="package-name">{pkg.name}</h4>
                    <div className="package-price">{pkg.price}</div>
                  </div>
                  <div className="package-features">
                    <ul>
                      {pkg.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <div className="package-note">{pkg.note}</div>
                    <button className="btn btn-primary-custom w-100 mt-3">Select Collection</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Your Journey to Perfection
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Four seamless steps to your dream wedding
          </motion.p>
          
          <div className="row">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="col-lg-3 col-md-6"
              >
                <div className="step-card">
                  <div className="step-number">{step.number}</div>
                  <h4 className="step-title">{step.title}</h4>
                  <p className="service-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Celebrated Love Stories
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Hear from couples who experienced wedding perfection
          </motion.p>
          
          <div className="row">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="col-lg-4"
              >
                <div className="testimonial-card">
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">{testimonial.author}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                <li><a href="">List Your Venue</a></li>
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
    </div>
  );
}