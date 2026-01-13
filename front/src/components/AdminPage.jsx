import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/AdminPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const [admin, setAdmin] = useState({
    id: 1,
    name: 'System Administrator',
    email: 'admin@weddingplanning.com',
    role: 'Super Admin',
    avatar: 'SA'
  });

  const [stats, setStats] = useState({
    totalVenues: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    activeBookings: 0,
    totalServiceProviders: 0,
    pendingPayments: 0
  });

  const [customers, setCustomers] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceDetails, setServiceDetails] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  // دالة لجلب تفاصيل الخدمة بناءً على نوعها
  const fetchServiceDetails = async (ownerId, ownerType) => {
    try {
      let serviceData = null;
      
      switch (ownerType) {
        case 'hall':
          const { data: hallData } = await supabase
            .from('halls')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          serviceData = hallData;
          break;
          
        case 'cake':
          const { data: cakeData } = await supabase
            .from('cakes')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          serviceData = cakeData;
          break;
          
        case 'decoration':
          const { data: decorData } = await supabase
            .from('decoration')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          serviceData = decorData;
          break;
          
        case 'photographer':
          const { data: photoData } = await supabase
            .from('photographers')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          serviceData = photoData;
          break;
          
        case 'music':
          const { data: musicData } = await supabase
            .from('musics')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          serviceData = musicData;
          break;
          
        case 'car':
          const { data: carData } = await supabase
            .from('cars')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          serviceData = carData;
          break;
          
        default:
          serviceData = null;
      }
      
      return serviceData;
    } catch (error) {
      console.error('Error fetching service details:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch service providers (Owners)
      const { data: ownersData, error: ownersError } = await supabase
        .from('owners')
        .select(`
          owner_id,
          owner_type,
          visible,
          accept,
          description,
          rate,
          created_at,
          users (
            id,
            name,
            email,
            phone,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (ownersError) throw ownersError;

      // جلب تفاصيل الخدمات لكل owner
      const ownersWithServices = await Promise.all(
        ownersData.map(async (owner) => {
          const serviceDetails = await fetchServiceDetails(owner.owner_id, owner.owner_type);
          
          // Determine status based on visible and accept
          let status;
          if (owner.visible && owner.accept === true) {
            status = 'Active';
          } else if (!owner.visible && owner.accept === false) {
            status = 'Rejected';
          } else {
            status = 'Pending'; // visible = false و accept = null
          }

          return {
            id: owner.owner_id,
            name: owner.users?.name || 'Unknown',
            type: owner.owner_type || 'Not specified',
            email: owner.users?.email || 'N/A',
            phone: owner.users?.phone || 'N/A',
            city: owner.users?.city || 'N/A',
            status: status,
            accept: owner.accept,
            visible: owner.visible,
            description: owner.description || '',
            rate: owner.rate || 0,
            created_at: owner.created_at,
            user: owner.users, // بيانات اليوزر كاملة
            service: serviceDetails // بيانات الخدمة
          };
        })
      );

      setServiceProviders(ownersWithServices);

      // Fetch customers (Users)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const formattedCustomers = usersData.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        city: user.city || 'N/A',
        joinDate: new Date(user.created_at).toLocaleDateString(),
        status: user.verified ? 'Active' : 'Inactive',
        verified: user.verified
      }));

      setCustomers(formattedCustomers);

      // Fetch reservations and payments
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          reservations_id,
          price,
          status,
          describtion,
          created_at,
          users!reservations_user_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (reservationsError) throw reservationsError;

      const formattedPayments = reservationsData.map(res => ({
        id: res.reservations_id,
        booking: res.reservations_id,
        customer: res.users?.name || 'Unknown',
        amount: res.price || 0,
        commission: (res.price || 0) * 0.15,
        netAmount: (res.price || 0) * 0.85,
        date: new Date(res.created_at).toLocaleDateString(),
        status: res.status ? 'Completed' : 'Pending',
        method: 'Credit Card',
        description: res.describtion || ''
      }));

      setPayments(formattedPayments);

      // Update statistics
      setStats({
        totalVenues: ownersData.filter(o => o.owner_type === 'hall').length,
        totalCustomers: usersData.length,
        pendingApprovals: ownersData.filter(o => !o.visible && o.accept === null).length,
        totalRevenue: formattedPayments.reduce((sum, p) => sum + p.amount, 0),
        activeBookings: reservationsData.filter(r => r.status).length,
        totalServiceProviders: ownersData.length,
        pendingPayments: formattedPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)
      });

      // Add notifications
      setNotifications(prev => [{
        id: Date.now(),
        text: 'Data updated successfully',
        time: 'Just now',
        type: 'success'
      }, ...prev.slice(0, 4)]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setNotifications(prev => [{
        id: Date.now(),
        text: `Error fetching data`,
        time: 'Just now',
        type: 'warning'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceProviderStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      
      const provider = serviceProviders.find(s => s.id === id);
      
      // Update visible and accept based on new status
      let updates = {};
      
      if (newStatus === 'Active') {
        updates = { visible: true, accept: true };
      } else if (newStatus === 'Rejected') {
        updates = { visible: false, accept: false };
      } else if (newStatus === 'Pending') {
        updates = { visible: false, accept: null };
      }
      
      const { error } = await supabase
        .from('owners')
        .update(updates)
        .eq('owner_id', id);

      if (error) throw error;

      // Update local data
      setServiceProviders(prev => prev.map(s => 
        s.id === id ? { 
          ...s, 
          status: newStatus,
          accept: updates.accept,
          visible: updates.visible
        } : s
      ));

      // Update statistics
      setStats(prev => ({
        ...prev,
        pendingApprovals: newStatus === 'Active' || newStatus === 'Rejected'
          ? Math.max(0, prev.pendingApprovals - 1) 
          : newStatus === 'Pending' 
            ? prev.pendingApprovals + 1
            : prev.pendingApprovals
      }));

      // Add notification
      const actionText = 
        newStatus === 'Active' ? 'activated' :
        newStatus === 'Rejected' ? 'rejected' :
        'set to pending';
      
      setNotifications(prev => [{
        id: Date.now(),
        text: `${actionText} service provider: ${provider?.name}`,
        time: 'Just now',
        type: newStatus === 'Active' ? 'success' : 'warning'
      }, ...prev.slice(0, 4)]);

    } catch (error) {
      console.error('Error updating service provider:', error);
      setNotifications(prev => [{
        id: Date.now(),
        text: `Error updating service provider status`,
        time: 'Just now',
        type: 'warning'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteServiceProvider = async (id) => {
    try {
      setIsLoading(true);
      const provider = serviceProviders.find(s => s.id === id);
      
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('owner_id', id);

      if (error) throw error;

      setServiceProviders(prev => prev.filter(s => s.id !== id));
      setStats(prev => ({
        ...prev,
        totalServiceProviders: prev.totalServiceProviders - 1,
        pendingApprovals: provider.status === 'Pending' 
          ? Math.max(0, prev.pendingApprovals - 1) 
          : prev.pendingApprovals
      }));
      
      setNotifications(prev => [{
        id: Date.now(),
        text: `Deleted service provider: ${provider?.name}`,
        time: 'Just now',
        type: 'warning'
      }, ...prev.slice(0, 4)]);

    } catch (error) {
      console.error('Error deleting service provider:', error);
      setNotifications(prev => [{
        id: Date.now(),
        text: `Error deleting service provider`,
        time: 'Just now',
        type: 'warning'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const customer = customers.find(c => c.id === id);
      const verified = newStatus === 'Active';
      
      const { error } = await supabase
        .from('users')
        .update({ verified: verified })
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === id ? { ...c, status: newStatus, verified: verified } : c
      ));

      setNotifications(prev => [{
        id: Date.now(),
        text: `${verified ? 'Activated' : 'Suspended'} customer: ${customer?.name}`,
        time: 'Just now',
        type: verified ? 'success' : 'warning'
      }, ...prev.slice(0, 4)]);

    } catch (error) {
      console.error('Error updating customer:', error);
      setNotifications(prev => [{
        id: Date.now(),
        text: `Error updating customer status`,
        time: 'Just now',
        type: 'warning'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const status = newStatus === 'Completed';
      
      const { error } = await supabase
        .from('reservations')
        .update({ status: status })
        .eq('reservations_id', id);

      if (error) throw error;

      setPayments(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));

      // Update stats
      const payment = payments.find(p => p.id === id);
      if (payment) {
        setStats(prev => ({
          ...prev,
          activeBookings: newStatus === 'Completed' 
            ? prev.activeBookings + 1 
            : Math.max(0, prev.activeBookings - 1),
          pendingPayments: newStatus === 'Completed'
            ? Math.max(0, prev.pendingPayments - payment.amount)
            : prev.pendingPayments + payment.amount
        }));
      }

      setNotifications(prev => [{
        id: Date.now(),
        text: `${newStatus === 'Completed' ? 'Completed' : 'Suspended'} payment #${id}`,
        time: 'Just now',
        type: newStatus === 'Completed' ? 'success' : 'warning'
      }, ...prev.slice(0, 4)]);

    } catch (error) {
      console.error('Error updating payment:', error);
      setNotifications(prev => [{
        id: Date.now(),
        text: `Error updating payment status`,
        time: 'Just now',
        type: 'warning'
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = async (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    
    // إذا كان نوع المودال viewProvider، نجلب تفاصيل الخدمة
    if (type === 'viewProvider' && item) {
      try {
        setIsLoading(true);
        const serviceData = await fetchServiceDetails(item.id, item.type);
        setServiceDetails(serviceData);
      } catch (error) {
        console.error('Error fetching service details:', error);
        setServiceDetails(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setServiceDetails(null);
    }
    
    setShowModal(true);
  };

  // دالة لعرض تفاصيل الخدمة حسب النوع
  const renderServiceDetails = (service) => {
    if (!service) return null;

    const serviceType = selectedItem?.type;
    
    switch (serviceType) {
      case 'hall':
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>🏛️ Hall Details</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Hall Name:</span>
                  <strong>{service.hall_name || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span className="text-muted">Address:</span>
                  <span>{service.address || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Capacity:</span>
                  <span>{service.capacity || 0} people</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Price Range:</span>
                  <span>{service.price_range || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Features:</span>
                  <span>{service.features || 'N/A'}</span>
                </div>
                {service.additional_info && (
                  <div className="info-item">
                    <span className="text-muted">Additional Info:</span>
                    <span>{service.additional_info}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );
        
      case 'cake':
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>🎂 Cake Details</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Cake Type:</span>
                  <strong>{service.cake_type || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span className="text-muted">Flavors:</span>
                  <span>{service.flavors || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Sizes:</span>
                  <span>{service.sizes || 'N/A'}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Price Range:</span>
                  <span>{service.price_range || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Decoration Style:</span>
                  <span>{service.decoration_style || 'N/A'}</span>
                </div>
                {service.special_notes && (
                  <div className="info-item">
                    <span className="text-muted">Special Notes:</span>
                    <span>{service.special_notes}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );
        
      case 'decoration':
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>🎨 Decoration Details</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Decoration Style:</span>
                  <strong>{service.decoration_style || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span className="text-muted">Theme:</span>
                  <span>{service.theme || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Price Range:</span>
                  <span>{service.price_range || 'N/A'}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Services Included:</span>
                  <span>{service.services_included || 'N/A'}</span>
                </div>
                {service.special_features && (
                  <div className="info-item">
                    <span className="text-muted">Special Features:</span>
                    <span>{service.special_features}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );
        
      case 'photographer':
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>📸 Photographer Details</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Studio Name:</span>
                  <strong>{service.studio_name || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span className="text-muted">Specialization:</span>
                  <span>{service.specialization || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Experience:</span>
                  <span>{service.experience_years || 0} years</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Package Price:</span>
                  <span>{service.package_price || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Equipment:</span>
                  <span>{service.equipment || 'N/A'}</span>
                </div>
                {service.portfolio_link && (
                  <div className="info-item">
                    <span className="text-muted">Portfolio:</span>
                    <a href={service.portfolio_link} target="_blank" rel="noopener noreferrer">
                      View Portfolio
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        );
        
      case 'music':
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>🎵 Music Details</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Band Name:</span>
                  <strong>{service.band_name || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span className="text-muted">Music Genre:</span>
                  <span>{service.music_genre || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Price Range:</span>
                  <span>{service.price_range || 'N/A'}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Members:</span>
                  <span>{service.members_count || 0} members</span>
                </div>
                {service.equipment_provided && (
                  <div className="info-item">
                    <span className="text-muted">Equipment:</span>
                    <span>{service.equipment_provided}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );
        
      case 'car':
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>🚗 Car Details</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Car Model:</span>
                  <strong>{service.car_model || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span className="text-muted">Car Type:</span>
                  <span>{service.car_type || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Year:</span>
                  <span>{service.year || 'N/A'}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="info-item">
                  <span className="text-muted">Price per Hour:</span>
                  <span>{service.price_per_hour || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="text-muted">Capacity:</span>
                  <span>{service.capacity || 0} people</span>
                </div>
                {service.features && (
                  <div className="info-item">
                    <span className="text-muted">Features:</span>
                    <span>{service.features}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );
        
      default:
        return (
          <>
            <h6 className="mt-4 mb-3" style={{ color: 'var(--gold)' }}>📋 Service Details</h6>
            <div className="p-3 bg-light rounded">
              <pre style={{ fontSize: '12px', margin: 0 }}>
                {JSON.stringify(service, null, 2)}
              </pre>
            </div>
          </>
        );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notifications]);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('.wps-navbar');
      if (!nav) return;
      if (window.scrollY > 40) nav.classList.add('navbar-scrolled'); 
      else nav.classList.remove('navbar-scrolled');
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderOverview = () => (
    <div className="row g-4">
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stats-icon">🏛️</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Venues</div>
          <div className="stats-value">{stats.totalVenues}</div>
        </motion.div>
      </div>
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stats-icon">👥</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Customers</div>
          <div className="stats-value">{stats.totalCustomers}</div>
        </motion.div>
      </div>
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stats-icon">⏳</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Pending Approvals</div>
          <div className="stats-value">{stats.pendingApprovals}</div>
        </motion.div>
      </div>
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stats-icon">💰</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Total Revenue</div>
          <div className="stats-value">{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-muted small">ILS</div>
        </motion.div>
      </div>
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stats-icon">📅</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Active Bookings</div>
          <div className="stats-value">{stats.activeBookings}</div>
        </motion.div>
      </div>
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="stats-icon">🎯</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Service Providers</div>
          <div className="stats-value">{stats.totalServiceProviders}</div>
        </motion.div>
      </div>
      <div className="col-md-6 col-lg-3">
        <motion.div 
          className="stats-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="stats-icon">💳</div>
          <div className="text-muted mb-2" style={{ fontWeight: 600 }}>Pending Payments</div>
          <div className="stats-value">{stats.pendingPayments.toLocaleString()}</div>
          <div className="text-muted small">ILS</div>
        </motion.div>
      </div>
    </div>
  );

  const renderServiceProviders = () => (
    <div className="section-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="section-header mb-0">Service Providers Management</h5>
        <div className="d-flex gap-2 align-items-center">
          {isLoading && <div className="loading-spinner me-2"></div>}
          <select 
            className="form-select form-control-custom" 
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button 
            className="btn btn-primary-custom btn-sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-custom">
          <thead>
            <tr>
              <th>Name</th>
              <th>Service Type</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceProviders
              .filter(v => filterStatus === 'all' || v.status === filterStatus)
              .map(provider => (
              <tr key={provider.id}>
                <td style={{ fontWeight: 600 }}>{provider.name}</td>
                <td>{provider.type}</td>
                <td>{provider.city}</td>
                <td>
                  <span className={`status-pill status-${provider.status.toLowerCase()}`}>
                    {provider.status}
                  </span>
                  <div className="small text-muted mt-1">
                    DB: visible={provider.visible ? 'true' : 'false'}, 
                    accept={provider.accept === true ? 'true' : 
                           provider.accept === false ? 'false' : 'null'}
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    {provider.status === 'Pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success" 
                          style={{ borderRadius: 8 }}
                          onClick={() => updateServiceProviderStatus(provider.id, 'Active')}
                          disabled={isLoading}
                          title="Approve & Activate"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          style={{ borderRadius: 8 }}
                          onClick={() => updateServiceProviderStatus(provider.id, 'Rejected')}
                          disabled={isLoading}
                          title="Reject"
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {provider.status === 'Active' && (
                      <button 
                        className="btn btn-sm btn-warning" 
                        style={{ borderRadius: 8 }}
                        onClick={() => updateServiceProviderStatus(provider.id, 'Pending')}
                        disabled={isLoading}
                        title="Deactivate"
                      >
                        ⏸ Deactivate
                      </button>
                    )}
                    {provider.status === 'Rejected' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success" 
                          style={{ borderRadius: 8 }}
                          onClick={() => updateServiceProviderStatus(provider.id, 'Active')}
                          disabled={isLoading}
                          title="Approve"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          style={{ borderRadius: 8 }}
                          onClick={() => updateServiceProviderStatus(provider.id, 'Pending')}
                          disabled={isLoading}
                          title="Reset to Pending"
                        >
                          ⟲ Reset
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-sm btn-outline-primary" 
                      style={{ borderRadius: 8 }}
                      onClick={() => openModal('viewProvider', provider)}
                      title="View Details"
                    >
                      👁️ View
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      style={{ borderRadius: 8 }}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${provider.name}?`)) {
                          deleteServiceProvider(provider.id);
                        }
                      }}
                      disabled={isLoading}
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {serviceProviders.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="text-muted">No service providers found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="section-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="section-header mb-0">Customer Management</h5>
        {isLoading && <div className="loading-spinner"></div>}
      </div>

      <div className="table-responsive">
        <table className="table table-custom">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td style={{ fontWeight: 600 }}>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.city}</td>
                <td>{customer.joinDate}</td>
                <td>
                  <span className={`status-pill status-${customer.status.toLowerCase()}`}>
                    {customer.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary" 
                      style={{ borderRadius: 8 }}
                      onClick={() => openModal('viewCustomer', customer)}
                      title="View Details"
                    >
                      👁️ View
                    </button>
                    {customer.status === 'Active' ? (
                      <button 
                        className="btn btn-sm btn-warning" 
                        style={{ borderRadius: 8 }}
                        onClick={() => updateCustomerStatus(customer.id, 'Inactive')}
                        disabled={isLoading}
                        title="Deactivate"
                      >
                        ⏸ Deactivate
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-success" 
                        style={{ borderRadius: 8 }}
                        onClick={() => updateCustomerStatus(customer.id, 'Active')}
                        disabled={isLoading}
                        title="Activate"
                      >
                        ✓ Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">No customers found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="section-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="section-header mb-0">Payments & Commissions</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-custom">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Commission</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td style={{ fontWeight: 600 }}>#{payment.id}</td>
                <td>{payment.customer}</td>
                <td>{payment.amount.toLocaleString()} ILS</td>
                <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{payment.commission.toLocaleString()} ILS</td>
                <td>{payment.date}</td>
                <td>
                  <span className={`status-pill status-${payment.status.toLowerCase()}`}>
                    {payment.status === 'Completed' ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary" 
                      style={{ borderRadius: 8 }}
                      onClick={() => openModal('viewPayment', payment)}
                      title="View Details"
                    >
                      👁️ View
                    </button>
                    {payment.status === 'Pending' && (
                      <button 
                        className="btn btn-sm btn-success" 
                        style={{ borderRadius: 8 }}
                        onClick={() => updatePaymentStatus(payment.id, 'Completed')}
                        disabled={isLoading}
                        title="Complete Payment"
                      >
                        ✓ Complete
                      </button>
                    )}
                    {payment.status === 'Completed' && (
                      <button 
                        className="btn btn-sm btn-warning" 
                        style={{ borderRadius: 8 }}
                        onClick={() => updatePaymentStatus(payment.id, 'Pending')}
                        disabled={isLoading}
                        title="Mark as Pending"
                      >
                        ↩️ Pending
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="text-muted">No payments found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light wps-navbar">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                width: 52, 
                height: 52, 
                borderRadius: 14,
                background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontWeight: 700,
                fontSize: '1.5rem',
                boxShadow: '0 8px 20px rgba(212,175,55,0.3)'
              }}
            >
              W
            </motion.div>
            <span className="ms-3 brand-primary">Wedding Planning System</span>
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
              <li className="nav-item"><a className="nav-link active" href="/admin">Admin</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="admin-hero container">
        <div className="hero-gradient"></div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <div className="row align-items-center mb-5">
            <div className="col-lg-8">
              <h1 style={{ 
                fontFamily: 'Playfair Display', 
                fontSize: '3rem', 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #D4AF37 0%, #8B7355 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}>
                Admin Dashboard
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                Complete management system for the Wedding Planning Platform
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className="d-inline-flex align-items-center gap-3 p-3" style={{
                background: 'white',
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{admin.name}</div>
                  <div className="text-muted" style={{ fontSize: '.95rem' }}>{admin.role}</div>
                </div>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 16, 
                  background: 'linear-gradient(135deg,#D4AF37 0%,#8B7355 100%)', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  boxShadow: '0 8px 20px rgba(212,175,55,0.3)'
                }}>
                  {admin.avatar}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="container my-5">
        <div className="row g-4">
          {/* Sidebar */}
          <aside className="col-lg-3">
            {/* Profile Card */}
            <motion.div 
              className="profile-card mb-4" 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="profile-avatar">{admin.avatar}</div>
              <div className="profile-content text-center">
                <h4 style={{ fontFamily: 'Playfair Display', fontWeight: 700, marginTop: '1rem' }}>
                  {admin.name}
                </h4>
                <div className="mb-3">
                  <span className="status-pill status-active">
                    {admin.role}
                  </span>
                </div>
              </div>
              
              <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                <div className="mb-3">
                  <div className="text-muted small mb-1">Email</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{admin.email}</div>
                </div>
                <div>
                  <div className="text-muted small mb-1">Access Level</div>
                  <div style={{ fontWeight: 600 }}>Full Control</div>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <button className="btn btn-outline-danger" style={{ borderRadius: 50 }} onClick={() => alert('Log out')}>
                  🚪 Logout
                </button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="section-card mb-4" 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h6 className="section-header" style={{ fontSize: '1.2rem' }}>Quick Actions</h6>
              <div className="d-grid gap-3">
                <div className="quick-action" onClick={() => setActiveTab('services')}>
                  <div className="quick-action-icon">🎯</div>
                  <div>Manage Services</div>
                </div>
                <div className="quick-action" onClick={() => setActiveTab('customers')}>
                  <div className="quick-action-icon">👥</div>
                  <div>Manage Customers</div>
                </div>
                <div className="quick-action" onClick={() => setActiveTab('payments')}>
                  <div className="quick-action-icon">💰</div>
                  <div>Payments</div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div 
              className="section-card" 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h6 className="section-header" style={{ fontSize: '1.2rem' }}>Notifications</h6>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} className="notification-item">
                    <div className="d-flex align-items-start gap-3">
                      <div className={`notification-icon notification-${n.type}`}>
                        {n.type === 'order' && '📦'}
                        {n.type === 'success' && '✅'}
                        {n.type === 'info' && 'ℹ️'}
                        {n.type === 'warning' && '⚠️'}
                      </div>
                      <div className="flex-grow-1">
                        <div style={{ fontSize: '.95rem', fontWeight: 500 }}>{n.text}</div>
                        <div className="text-muted small mt-1">{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          </aside>

          {/* Main Content Area */}
          <section className="col-lg-9">
            {/* Tab Navigation */}
            <div className="tab-nav">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                🎯 Service Providers
              </button>
              <button 
                className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                👥 Customers
              </button>
              <button 
                className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                💰 Payments
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'services' && renderServiceProviders()}
                {activeTab === 'customers' && renderCustomers()}
                {activeTab === 'payments' && renderPayments()}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <div style={{ 
                fontFamily: 'Playfair Display', 
                color: 'var(--gold)', 
                fontSize: '1.5rem', 
                fontWeight: 700,
                marginBottom: '0.8rem'
              }}>
                Wedding Planning System
              </div>
              <p className="text-muted mb-0" style={{ color: '#c9c5c0' }}>
                Complete administrative control for the wedding planning platform.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex gap-4 justify-content-md-end flex-wrap">
                <div>
                  <div className="text-muted small mb-2" style={{ fontWeight: 600 }}>Company</div>
                  <div className="text-muted small">About • Careers • Blog</div>
                </div>
                <div>
                  <div className="text-muted small mb-2" style={{ fontWeight: 600 }}>Support</div>
                  <div className="text-muted small">Help • Contact • Terms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-muted small mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            © {new Date().getFullYear()} Wedding Planning System — Admin Dashboard
          </div>
        </div>
      </footer>

      {/* View Details Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
            style={{ zIndex: 2000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="modal-custom" 
              style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className="modal-header-custom">
                {modalType === 'viewProvider' && '🎯 Service Provider Details'}
                {modalType === 'viewCustomer' && '👤 Customer Details'}
                {modalType === 'viewPayment' && '💰 Payment Details'}
              </h5>
              
              {selectedItem && (
                <div>
                  {modalType === 'viewProvider' && (
                    <div>
                      {isLoading && (
                        <div className="text-center py-3">
                          <div className="loading-spinner"></div>
                          <div className="text-muted small mt-2">Loading service details...</div>
                        </div>
                      )}
                      
                      {!isLoading && (
                        <>
                          <h6 className="mb-3" style={{ color: 'var(--gold)' }}>👤 Owner Information</h6>
                          <div className="row mb-4">
                            <div className="col-md-6">
                              <div className="info-item">
                                <span className="text-muted">Name:</span>
                                <strong>{selectedItem.name || 'N/A'}</strong>
                              </div>
                              <div className="info-item">
                                <span className="text-muted">Email:</span>
                                <span>{selectedItem.email || 'N/A'}</span>
                              </div>
                              <div className="info-item">
                                <span className="text-muted">Phone:</span>
                                <span>{selectedItem.phone || 'N/A'}</span>
                              </div>
                              <div className="info-item">
                                <span className="text-muted">City:</span>
                                <span>{selectedItem.city || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="info-item">
                                <span className="text-muted">Service Type:</span>
                                <span className="badge bg-warning">{selectedItem.type || 'N/A'}</span>
                              </div>
                              <div className="info-item">
                                <span className="text-muted">Status:</span>
                                <span className={`status-pill status-${selectedItem.status?.toLowerCase() || 'pending'}`}>
                                  {selectedItem.status || 'Pending'}
                                </span>
                              </div>
                              <div className="info-item">
                                <span className="text-muted">Rate:</span>
                                <span>⭐ {selectedItem.rate || 0}/5</span>
                              </div>
                              <div className="info-item">
                                <span className="text-muted">Created:</span>
                                <span>{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {selectedItem.description && (
                            <div className="mb-4">
                              <h6 className="mb-2" style={{ color: 'var(--gold)' }}>📝 Description</h6>
                              <div className="p-3 bg-light rounded">
                                {selectedItem.description}
                              </div>
                            </div>
                          )}
                          
                          {serviceDetails ? (
                            renderServiceDetails(serviceDetails)
                          ) : (
                            <div className="alert alert-warning">
                              <div className="d-flex align-items-center">
                                <span className="me-2">⚠️</span>
                                <span>No service details found for this {selectedItem.type} provider.</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 small text-muted">
                            <div><strong>Database Values:</strong></div>
                            <div>visible = {selectedItem.visible ? 'true' : 'false'}</div>
                            <div>accept = {selectedItem.accept === true ? 'true' : 
                                           selectedItem.accept === false ? 'false' : 'null'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {modalType === 'viewCustomer' && (
                    <div>
                      <div className="mb-3">
                        <label className="text-muted small">Name</label>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedItem.name}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Email</label>
                        <div>{selectedItem.email}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Phone</label>
                        <div>{selectedItem.phone}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">City</label>
                        <div>{selectedItem.city}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Join Date</label>
                        <div>{selectedItem.joinDate}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Status</label>
                        <div>
                          <span className={`status-pill status-${selectedItem.status.toLowerCase()}`}>
                            {selectedItem.status === 'Active' ? 'Active' : 'Inactive'}
                          </span>
                          <div className="small text-muted mt-1">
                            Database value: verified={selectedItem.verified ? 'true' : 'false'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalType === 'viewPayment' && (
                    <div>
                      <div className="mb-3">
                        <label className="text-muted small">Payment ID</label>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>#{selectedItem.id}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Customer</label>
                        <div>{selectedItem.customer}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Total Amount</label>
                        <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{selectedItem.amount.toLocaleString()} ILS</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Commission (15%)</label>
                        <div style={{ color: 'var(--gold)', fontWeight: 600 }}>{selectedItem.commission.toLocaleString()} ILS</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Net Amount</label>
                        <div style={{ fontWeight: 600 }}>{selectedItem.netAmount.toLocaleString()} ILS</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Payment Date</label>
                        <div>{selectedItem.date}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Payment Method</label>
                        <div>{selectedItem.method}</div>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Status</label>
                        <div>
                          <span className={`status-pill status-${selectedItem.status.toLowerCase()}`}>
                            {selectedItem.status === 'Completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="d-flex justify-content-end gap-3 mt-4">
                <button 
                  className="btn btn-outline-custom" 
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}