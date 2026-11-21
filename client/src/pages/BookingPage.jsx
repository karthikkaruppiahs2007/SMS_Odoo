import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner';
import ScrollReveal from '../components/common/ScrollReveal';
import api from '../services/api';

const DEFAULT_SPORTS = [
  { value: 'BADMINTON', label: 'Badminton Court', icon: 'fa-table-tennis-paddle-ball' },
  { value: 'TENNIS', label: 'Tennis Court', icon: 'fa-baseball' },
  { value: 'SQUASH', label: 'Squash Court', icon: 'fa-table-tennis' },
  { value: 'BASKETBALL', label: 'Basketball Court', icon: 'fa-basketball' },
  { value: 'CRICKET_NET', label: 'Cricket Practice Net', icon: 'fa-baseball-bat-ball' },
  { value: 'SWIMMING', label: 'Olympic Swimming Lane', icon: 'fa-person-swimming' },
];

export default function BookingPage() {
  const [sports, setSports] = useState(DEFAULT_SPORTS);
  const [selectedSport, setSelectedSport] = useState('BADMINTON');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [playerCount, setPlayerCount] = useState(1);
  const [pricing, setPricing] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [holdData, setHoldData] = useState(null);
  const [holdTimer, setHoldTimer] = useState(180);
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'history'
  const [bookingsList, setBookingsList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => api.auth.getUser());

  // Pre-fill user data if logged in
  useEffect(() => {
    const user = api.auth.getUser();
    if (user) {
      setCurrentUser(user);
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, []);

  // 1. Fetch Sports from backend
  useEffect(() => {
    const loadSports = async () => {
      try {
        const res = await api.sports.getSports();
        if (res.sports && Array.isArray(res.sports) && res.sports.length > 0) {
          const mapped = res.sports.map((s) => ({
            value: s.sport,
            label: `${s.sport.charAt(0) + s.sport.slice(1).toLowerCase().replace('_', ' ')} Court`,
            capacity: s.capacity,
            basePrice: s.basePrice,
          }));
          setSports(mapped);
        }
      } catch (err) {
        console.warn('Using default sports list:', err.message);
      }
    };
    loadSports();
  }, []);

  // 2. Fetch Pricing Rules for Selected Sport
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await api.sports.getPricing(selectedSport);
        setPricing(res.pricing || res);
      } catch (err) {
        console.warn('Failed to load pricing:', err.message);
      }
    };
    loadPricing();
  }, [selectedSport]);

  // 3. Fetch Slots whenever sport or date changes
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedSport || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await api.sports.getSlots(selectedSport, selectedDate);
        const slots = res.slots || [];
        setAvailableSlots(slots);
        // Select first available slot if present
        const firstAvailable = slots.find((s) => s.isAvailable);
        if (firstAvailable) {
          setSelectedSlot(firstAvailable.startTime);
        }
      } catch (err) {
        console.warn('Failed to fetch real-time slots:', err.message);
        // Fallback standard slots
        const defaultTimes = ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        setAvailableSlots(
          defaultTimes.map((time) => ({
            startTime: time,
            endTime: `${time.split(':')[0]}:30`,
            isAvailable: true,
            remainingCapacity: 4,
          }))
        );
        setSelectedSlot('08:00');
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedSport, selectedDate]);

  // 4. Load Bookings History
  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await api.bookings.getAll({ page: 1, limit: 15 });
      setBookingsList(res.bookings || []);
    } catch (err) {
      console.warn('Error loading bookings:', err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadBookings();
    }
  }, [activeTab]);

  // Hold countdown timer
  useEffect(() => {
    if (!holdData || holdTimer <= 0) return;
    const interval = setInterval(() => {
      setHoldTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHoldData(null);
          setStatusMessage({
            type: 'error',
            text: 'Your 3-minute booking hold has expired. Please select a slot again.',
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdData, holdTimer]);

  // Handle Form Submission: Create Hold & Confirm
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!selectedSlot) {
      setStatusMessage({ type: 'error', text: 'Please select an available time slot.' });
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create Hold
      const holdRes = await api.bookings.createHold({
        sport: selectedSport,
        date: selectedDate,
        startTime: selectedSlot,
        playerCount: Number(playerCount),
      });

      const hold = holdRes.hold || holdRes;
      setHoldData(hold);
      setHoldTimer(180);

      // Step 2: Auto Confirm Hold (deduct wallet / confirm reservation)
      const confirmRes = await api.bookings.confirmHold({
        holdId: hold.id,
      });

      setSubmitting(false);
      setHoldData(null);
      setStatusMessage({
        type: 'success',
        text: `Success! Court reservation for ${selectedSport} on ${selectedDate} at ${selectedSlot} has been confirmed.`,
      });

      // Reload slots and recent bookings
      const slotsRes = await api.sports.getSlots(selectedSport, selectedDate);
      setAvailableSlots(slotsRes.slots || []);
      if (activeTab === 'history') {
        loadBookings();
      }
    } catch (err) {
      setSubmitting(false);
      // If user is not authenticated or needs wallet topup
      if (err.status === 401) {
        setStatusMessage({
          type: 'error',
          text: 'Please log in to finalize and confirm your court booking.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Booking reservation could not be processed.',
        });
      }
    }
  };

  // Handle Booking Cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A 50% refund will be credited back.')) {
      return;
    }
    try {
      await api.bookings.cancel(bookingId);
      setStatusMessage({
        type: 'success',
        text: 'Booking cancelled successfully. 50% refund has been processed.',
      });
      loadBookings();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to cancel booking.',
      });
    }
  };

  // Calculate estimated price
  const estimatedPrice = pricing
    ? Number(pricing.basePrice || 350) * Number(playerCount)
    : 350 * Number(playerCount);

  return (
    <main>
      {/* Banner */}
      <PageBanner title="Booking Court" current="Booking Court" bannerClass="banner-inner-booking" />

      {/* Top Nav Tabs */}
      <div className="bg-[#121212] border-b border-[#282828] py-4">
        <div className="hero-container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
                activeTab === 'book'
                  ? 'bg-[#C6EF2E] text-black shadow-lg shadow-[#C6EF2E]/20'
                  : 'bg-[#1E1E1E] text-white hover:bg-[#282828]'
              }`}
            >
              <i className="fa-solid fa-calendar-plus mr-2"></i> Book A Court
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
                activeTab === 'history'
                  ? 'bg-[#C6EF2E] text-black shadow-lg shadow-[#C6EF2E]/20'
                  : 'bg-[#1E1E1E] text-white hover:bg-[#282828]'
              }`}
            >
              <i className="fa-solid fa-receipt mr-2"></i> View Bookings Schedule
            </button>
          </div>

          {currentUser ? (
            <div className="d-none d-md-flex align-items-center gap-2 text-sm text-[#A0A0A0]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C6EF2E]"></span>
              Logged in as <strong className="text-white">{currentUser.name || currentUser.email}</strong>
            </div>
          ) : (
            <div className="d-none d-md-flex align-items-center gap-2 text-sm text-[#A0A0A0]">
              <Link to="/login" className="text-[#C6EF2E] hover:underline font-semibold">
                Login
              </Link>{' '}
              for instant wallet booking & member discounts
            </div>
          )}
        </div>
      </div>

      {activeTab === 'book' ? (
        <>
          {/* How to Book Process Section */}
          <div className="section">
            <div className="hero-container">
              <div className="d-flex flex-column gspace-5">
                <ScrollReveal animation="fade-up" className="booking-process-heading">
                  <div className="sub-heading">
                    <i className="fa-solid fa-circle accent-color-2"></i>
                    <span className="sub-heading-title">Real-Time Booking</span>
                  </div>
                  <h2>Reserve Your Court in Seconds — Live Availability</h2>
                </ScrollReveal>

                <div className="row row-cols-xl-4 row-cols-md-2 row-cols-1 grid-spacer-2">
                  <div className="col">
                    <ScrollReveal animation="fade-up" delay={50}>
                      <div className="card card-process">
                        <div className="icon">
                          <h4 className="accent-color mb-0">01</h4>
                        </div>
                        <div>
                          <h4>Select Sport</h4>
                          <p>Badminton, Tennis, Squash, Basketball & more</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                  <div className="col">
                    <ScrollReveal animation="fade-up" delay={150}>
                      <div className="card card-process">
                        <div className="icon">
                          <h4 className="accent-color mb-0">02</h4>
                        </div>
                        <div>
                          <h4>Pick Date & Slot</h4>
                          <p>Live capacity & concurrency-protected slots</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                  <div className="col">
                    <ScrollReveal animation="fade-up" delay={250}>
                      <div className="card card-process">
                        <div className="icon">
                          <h4 className="accent-color mb-0">03</h4>
                        </div>
                        <div>
                          <h4>3-Min Hold</h4>
                          <p>Temporary hold locks capacity while finalizing</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                  <div className="col">
                    <ScrollReveal animation="fade-up" delay={350}>
                      <div className="card card-process">
                        <div className="icon">
                          <h4 className="accent-color mb-0">04</h4>
                        </div>
                        <div>
                          <h4>Instant Confirmation</h4>
                          <p>Instant booking confirmation logged to database</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form & Details Section */}
          <div className="section pt-0">
            <div className="hero-container">
              <div className="booking-form-wrapper">
                {/* Booking Form Card */}
                <div className="card card-booking-form bg-[#181818] border border-[#282828] p-6 rounded-3xl">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="secondary-accent mb-0">Book Your Court Now</h3>
                    {holdData && (
                      <div className="bg-[#C6EF2E]/10 border border-[#C6EF2E] text-[#C6EF2E] px-3 py-1 rounded-full text-xs font-mono font-bold">
                        Hold Expires: {Math.floor(holdTimer / 60)}:{(holdTimer % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <p className="accent-color-8 text-sm">
                    Select your preferred sport, date, and live slot. Concurrency-safe and instantly confirmed.
                  </p>
                  <div className="underline-primary-accent mb-4"></div>

                  {statusMessage && (
                    <div
                      className={`p-4 rounded-2xl mb-4 d-flex align-items-center gap-3 ${
                        statusMessage.type === 'success'
                          ? 'bg-[#C6EF2E]/10 border border-[#C6EF2E] text-[#C6EF2E]'
                          : 'bg-red-500/10 border border-red-500 text-red-400'
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          statusMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                        } text-xl`}
                      ></i>
                      <div className="text-sm font-medium">{statusMessage.text}</div>
                    </div>
                  )}

                  <form id="booking-form" onSubmit={handleSubmit} className="form">
                    {/* 1. Sport Selector */}
                    <div className="mb-4">
                      <label className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-2 d-block">
                        Select Sport Court
                      </label>
                      <div className="row row-cols-3 row-cols-md-3 g-2">
                        {sports.map((s) => (
                          <div key={s.value} className="col">
                            <button
                              type="button"
                              onClick={() => setSelectedSport(s.value)}
                              className={`w-100 p-3 rounded-2xl text-left border transition-all d-flex flex-column gap-1 ${
                                selectedSport === s.value
                                  ? 'bg-[#C6EF2E] text-black border-[#C6EF2E] font-bold shadow-md'
                                  : 'bg-[#202020] text-white border-[#303030] hover:border-[#505050]'
                              }`}
                            >
                              <span className="text-xs">{s.label}</span>
                              <span className="text-[10px] opacity-75">Cap: {s.capacity || 4}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Date and Player Count */}
                    <div className="row row-cols-md-2 row-cols-1 grid-spacer-2 mb-3">
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="date" className="text-xs font-bold text-[#A0A0A0]">
                            Select Date
                          </label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-[#202020] border border-[#303030] text-white rounded-xl p-3"
                            required
                          />
                        </div>
                      </div>

                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="playerCount" className="text-xs font-bold text-[#A0A0A0]">
                            Number of Players
                          </label>
                          <select
                            id="playerCount"
                            value={playerCount}
                            onChange={(e) => setPlayerCount(e.target.value)}
                            className="bg-[#202020] border border-[#303030] text-white rounded-xl p-3"
                          >
                            <option value="1">1 Player</option>
                            <option value="2">2 Players (Doubles)</option>
                            <option value="3">3 Players</option>
                            <option value="4">4 Players (Full Court)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 3. Live Slot Selector */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                          Select Available Time Slot
                        </label>
                        {loadingSlots && (
                          <span className="text-xs text-[#C6EF2E]">
                            <i className="fa-solid fa-spinner fa-spin mr-1"></i> Checking capacity...
                          </span>
                        )}
                      </div>

                      {availableSlots.length === 0 && !loadingSlots ? (
                        <div className="p-4 bg-[#202020] rounded-2xl text-center text-[#A0A0A0] text-sm">
                          No available slots found for this date. Please choose another date.
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                          {availableSlots.map((slot) => {
                            const isSelected = selectedSlot === slot.startTime;
                            const isAvail = slot.isAvailable !== false;
                            return (
                              <button
                                key={slot.startTime}
                                type="button"
                                disabled={!isAvail}
                                onClick={() => setSelectedSlot(slot.startTime)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                  isSelected
                                    ? 'bg-[#C6EF2E] text-black border-[#C6EF2E] font-bold shadow-md'
                                    : isAvail
                                    ? 'bg-[#222222] text-white border-[#333333] hover:border-[#C6EF2E]'
                                    : 'bg-[#181818] text-[#555555] border-[#252525] cursor-not-allowed opacity-50'
                                }`}
                              >
                                {slot.startTime}
                                {slot.remainingCapacity !== undefined && isAvail && (
                                  <span className="ml-1 opacity-60 text-[10px]">({slot.remainingCapacity} left)</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 4. User Information */}
                    <div className="row row-cols-md-2 row-cols-1 grid-spacer-2 mb-3">
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="name" className="text-xs font-bold text-[#A0A0A0]">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your full name"
                            className="bg-[#202020] border border-[#303030] text-white rounded-xl p-3"
                            required
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="email" className="text-xs font-bold text-[#A0A0A0]">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter your email"
                            className="bg-[#202020] border border-[#303030] text-white rounded-xl p-3"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row row-cols-md-2 row-cols-1 grid-spacer-2 mb-3">
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="phone" className="text-xs font-bold text-[#A0A0A0]">
                            10-Digit Mobile Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="9876543210"
                            pattern="[6-9][0-9]{9}"
                            className="bg-[#202020] border border-[#303030] text-white rounded-xl p-3"
                            required
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="notes" className="text-xs font-bold text-[#A0A0A0]">
                            Special Requests / Gear
                          </label>
                          <input
                            type="text"
                            name="notes"
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Racket rentals, coach..."
                            className="bg-[#202020] border border-[#303030] text-white rounded-xl p-3"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Estimation Summary */}
                    <div className="bg-[#202020] border border-[#303030] rounded-2xl p-4 mb-4 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-xs text-[#A0A0A0]">Estimated Total</div>
                        <div className="text-xl font-bold text-[#C6EF2E]">₹{estimatedPrice}</div>
                      </div>
                      <div className="text-right text-xs text-[#A0A0A0]">
                        <div>Slot: {selectedSlot || 'Select slot'}</div>
                        <div>Duration: 30 minutes</div>
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={submitting || !selectedSlot}
                        className={`btn btn-accent w-100 justify-content-center py-3 ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="btn-title">
                          {submitting ? 'Confirming Reservation...' : 'Confirm Court Booking'}
                        </span>
                        <span className="icon-circle">
                          <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Booking Details Aside */}
                <div className="booking-form-detail">
                  <div className="d-flex flex-column gspace-2">
                    <h3>Why Book with Adelux?</h3>
                    <div className="underline-accent-5"></div>
                    <div className="row row-cols-md-2 row-cols-1 grid-spacer-2">
                      <div className="col">
                        <ul className="check-list">
                          <li>Official tournament court surfaces</li>
                          <li>On-demand pro coaches & racket rentals</li>
                          <li>Clean locker rooms & player lounges</li>
                        </ul>
                      </div>
                      <div className="col">
                        <ul className="check-list">
                          <li>50% cancellation refund policy</li>
                          <li>Instant capacity concurrency protection</li>
                          <li>Automated lights & session timer</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column gspace-2 mt-4">
                    <h3>Court Schedule & Hours</h3>
                    <div className="underline-accent-5"></div>
                    <div className="d-flex flex-column text-[#C0C0C0]">
                      <h5 className="font-semibold text-white">Daily Slots: 06:00 AM - 10:00 PM</h5>
                      <p className="text-sm">Each slot duration is 30 minutes with a 3-minute hold buffer.</p>
                    </div>
                  </div>

                  <div className="d-flex flex-column gspace-2 mt-4">
                    <h3>Membership Discounts</h3>
                    <div className="underline-accent-5"></div>
                    <div className="d-flex flex-column text-sm text-[#A0A0A0] gap-1">
                      <div>
                        <strong className="text-white">Gold Members:</strong> 20% discount on all court bookings
                      </div>
                      <div>
                        <strong className="text-white">Silver Members:</strong> 10% discount on all court bookings
                      </div>
                      <div>
                        <strong className="text-white">Junior Members:</strong> 15% discount on coaching & slots
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* History & Schedule Tab */
        <div className="section py-8">
          <div className="hero-container">
            <div className="card bg-[#181818] border border-[#282828] p-6 rounded-3xl">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h3 className="text-white font-bold mb-1">Court Bookings Schedule</h3>
                  <p className="text-[#A0A0A0] text-sm mb-0">Live bookings logged across all facility courts.</p>
                </div>
                <button
                  type="button"
                  onClick={loadBookings}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] text-white rounded-xl text-xs font-semibold"
                >
                  <i className="fa-solid fa-rotate mr-1"></i> Refresh
                </button>
              </div>

              {loadingBookings ? (
                <div className="py-12 text-center text-[#A0A0A0]">
                  <i className="fa-solid fa-spinner fa-spin text-2xl text-[#C6EF2E] mb-2 d-block"></i>
                  Loading bookings schedule...
                </div>
              ) : bookingsList.length === 0 ? (
                <div className="py-12 text-center text-[#707070]">
                  <i className="fa-regular fa-calendar-xmark text-4xl mb-3 d-block text-[#505050]"></i>
                  No bookings found in the system yet. Be the first to reserve a court!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-100 text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#282828] text-xs text-[#808080] uppercase tracking-wider">
                        <th className="py-3 px-4">Court</th>
                        <th className="py-3 px-4">Slot Date & Time</th>
                        <th className="py-3 px-4">Booked By</th>
                        <th className="py-3 px-4">Players</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222] text-sm">
                      {bookingsList.map((b) => (
                        <tr key={b.id} className="hover:bg-[#1F1F1F] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            <span className="w-2 h-2 rounded-full bg-[#C6EF2E] d-inline-block mr-2"></span>
                            {b.whichCourt}
                          </td>
                          <td className="py-3.5 px-4 text-[#C0C0C0]">
                            {new Date(b.slot).toLocaleDateString()} at{' '}
                            {new Date(b.slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-white font-medium">{b.user?.name || 'Club Member'}</div>
                            <div className="text-xs text-[#808080]">{b.user?.phone || b.user?.email || ''}</div>
                          </td>
                          <td className="py-3.5 px-4 text-[#A0A0A0]">{b.playerCount} player(s)</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#C6EF2E]">₹{Number(b.totalAmount)}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                b.status === 'CONFIRMED'
                                  ? 'bg-[#C6EF2E]/10 text-[#C6EF2E] border border-[#C6EF2E]/30'
                                  : b.status === 'HELD'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {b.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold"
                              >
                                Cancel (50% Refund)
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact CTA Section */}
      <div className="section py-0">
        <div className="hero-container">
          <div className="card card-contact-cta">
            <div className="contact-cta-content">
              <h2 className="primary-accent">Ready to Train with the Best?</h2>
              <p className="primary-accent">
                Whether you're picking up a racquet for the first time or aiming for pro tournaments, our coaches are
                here to support your journey.
              </p>
              <div>
                <Link to="/contact" className="btn btn-accent bg-accent-color-6">
                  <span className="btn-title">Book a Trial Session</span>
                  <span className="icon-circle">
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </Link>
              </div>
            </div>

            <div className="contact-cta-image">
              <div className="image-wrapper">
                <img src="/assets/images/2AH2LFJ-1.png" alt="Contact CTA" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
