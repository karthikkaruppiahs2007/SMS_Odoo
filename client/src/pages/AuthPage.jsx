import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner';
import ScrollReveal from '../components/common/ScrollReveal';
import api from '../services/api';

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = (params.get('tier') || 'SILVER').toUpperCase();
    return {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      level: 'Intermediate',
      membership: ['JUNIOR', 'SILVER', 'GOLD'].includes(tierParam) ? tierParam : 'SILVER',
    };
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.auth.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      setLoading(false);
      setStatusMessage({
        type: 'success',
        text: res.message || 'Login successful! Welcome back to Adelux Padel Club.',
      });
      setTimeout(() => {
        navigate('/front-desk');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Login failed. Please verify your email and password.',
      });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setLoading(false);
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match. Please verify your password.',
      });
      return;
    }

    try {
      const res = await api.auth.register({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        membership: registerForm.membership || 'SILVER',
      });

      setLoading(false);
      setStatusMessage({
        type: 'success',
        text: res.message || 'Account created successfully! Welcome to the Adelux community.',
      });
      setTimeout(() => {
        navigate('/front-desk');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setStatusMessage({
        type: 'error',
        text: err.message || (err.errors && err.errors[0]) || 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <main>
      <PageBanner
        title={mode === 'login' ? 'Member Sign In' : 'Create an Account'}
        current={mode === 'login' ? 'Login' : 'Register'}
        bannerClass="banner-inner-contact"
      />

      <div className="section py-5">
        <div className="hero-container">
          <div className="max-w-4xl mx-auto">
            {/* Mode Switcher Tabs */}
            <div className="d-flex justify-content-center mb-5">
              <div className="bg-[#1a1a1a] p-1.5 rounded-full border border-gray-800 d-inline-flex gap-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setStatusMessage(null);
                  }}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border-0 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#C6EF2E] text-black shadow-md'
                      : 'text-gray-400 hover:text-white bg-transparent'
                  }`}
                >
                  <i className="fa-solid fa-right-to-bracket mr-2"></i>
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setStatusMessage(null);
                  }}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border-0 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[#C6EF2E] text-black shadow-md'
                      : 'text-gray-400 hover:text-white bg-transparent'
                  }`}
                >
                  <i className="fa-solid fa-user-plus mr-2"></i>
                  Create Account
                </button>
              </div>
            </div>

            <ScrollReveal animation="fade-up">
              <div className="row g-0 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 bg-[#141414]">
                {/* Left Side: Brand & Community Showcase */}
                <div className="col-lg-5 p-5 bg-[#0f0f0f] text-white d-flex flex-column justify-content-between border-end border-gray-800">
                  <div>
                    <div className="mb-4">
                      <img
                        src="/assets/images/Adelux-Logo.png"
                        alt="Adelux"
                        style={{ maxHeight: '42px', objectFit: 'contain' }}
                      />
                    </div>
                    <span className="badge bg-[#C6EF2E] text-black font-bold uppercase tracking-wider text-xs px-3 py-1 rounded-full mb-3 d-inline-block">
                      Padel Club & Academy
                    </span>
                    <h3 className="text-white text-3xl font-bold leading-tight mb-3">
                      {mode === 'login' ? 'Welcome Back, Champion' : 'Elevate Your Padel Journey'}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {mode === 'login'
                        ? 'Sign in to reserve courts in seconds, view upcoming club matches, track your stats, and manage your membership.'
                        : 'Join New York’s premier padel community. Unlock priority court booking, certified coaching, and member-only events.'}
                    </p>

                    <div className="d-flex flex-column gap-3 pt-3 border-top border-gray-800">
                      <div className="d-flex align-items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C6EF2E]/15 text-[#C6EF2E] d-flex align-items-center justify-content-center font-bold text-sm">
                          <i className="fa-solid fa-bolt"></i>
                        </div>
                        <span className="text-sm text-gray-300">Instant 30-min slot booking</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C6EF2E]/15 text-[#C6EF2E] d-flex align-items-center justify-content-center font-bold text-sm">
                          <i className="fa-solid fa-trophy"></i>
                        </div>
                        <span className="text-sm text-gray-300">Club tournaments & prize pools</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C6EF2E]/15 text-[#C6EF2E] d-flex align-items-center justify-content-center font-bold text-sm">
                          <i className="fa-solid fa-users"></i>
                        </div>
                        <span className="text-sm text-gray-300">2,500+ active player community</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-top border-gray-800 text-xs text-gray-500">
                    Need support? Contact us at{' '}
                    <a href="mailto:support@adeluxpadel.com" className="text-[#C6EF2E] hover:underline">
                      support@adeluxpadel.com
                    </a>
                  </div>
                </div>

                {/* Right Side: Interactive Form */}
                <div className="col-lg-7 p-5 bg-[#181818] text-white">
                  {statusMessage && (
                    <div
                      className={`p-3 rounded-xl mb-4 d-flex align-items-center gap-3 text-sm ${
                        statusMessage.type === 'success'
                          ? 'bg-[#C6EF2E]/20 text-[#C6EF2E] border border-[#C6EF2E]/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          statusMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                        }`}
                      ></i>
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  {mode === 'login' ? (
                    /* LOGIN FORM */
                    <form onSubmit={handleLoginSubmit} className="d-flex flex-column gap-3">
                      <div>
                        <h4 className="text-white text-xl font-bold mb-1">Sign In to Your Account</h4>
                        <p className="text-gray-400 text-xs mb-4">
                          Enter your registered email and password to continue.
                        </p>
                      </div>

                      <div className="form-group">
                        <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1.5 d-block">
                          Email Address
                        </label>
                        <div className="position-relative">
                          <input
                            type="email"
                            required
                            placeholder="player@adeluxpadel.com"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="d-flex justify-content-between align-items-center mb-1.5">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-0">
                            Password
                          </label>
                          <a
                            href="#forgot"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Password reset link has been dispatched to your email.');
                            }}
                            className="text-xs text-[#C6EF2E] hover:underline"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <div className="position-relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all pe-5"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="position-absolute end-0 top-50 translate-middle-y me-3 bg-transparent border-0 text-gray-400 hover:text-white cursor-pointer"
                            aria-label="Toggle password visibility"
                          >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 my-1">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={loginForm.rememberMe}
                          onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                          className="rounded text-[#C6EF2E] focus:ring-0 bg-[#242424] border-gray-700 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer mb-0">
                          Keep me signed in on this device
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-accent w-100 justify-content-center py-3 mt-2"
                      >
                        {loading ? (
                          <span className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            Signing In...
                          </span>
                        ) : (
                          <>
                            <span className="btn-title font-bold">Sign In to Adelux</span>
                            <span className="icon-circle">
                              <i className="fa-solid fa-arrow-right"></i>
                            </span>
                          </>
                        )}
                      </button>

                      <div className="text-center mt-3 pt-3 border-top border-gray-800 text-xs text-gray-400">
                        Don't have an account yet?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('register');
                            setStatusMessage(null);
                          }}
                          className="text-[#C6EF2E] font-bold bg-transparent border-0 cursor-pointer hover:underline"
                        >
                          Create one now
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* REGISTER FORM */
                    <form onSubmit={handleRegisterSubmit} className="d-flex flex-column gap-3">
                      <div>
                        <h4 className="text-white text-xl font-bold mb-1">Join Adelux Padel Club</h4>
                        <p className="text-gray-400 text-xs mb-3">
                          Fill out the details below to register your player profile.
                        </p>
                      </div>

                      <div className="row g-2">
                        <div className="col-12 col-md-6">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Alex Morgan"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all"
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+1 (555) 000-0000"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="player@adeluxpadel.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all"
                        />
                      </div>

                      <div className="row g-2">
                        <div className="col-12 col-md-6">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                            Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            placeholder="Min 6 chars"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all"
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                            Confirm Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            placeholder="Re-enter password"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="row g-2">
                        <div className="col-12 col-md-6">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                            Skill Level
                          </label>
                          <select
                            value={registerForm.level}
                            onChange={(e) => setRegisterForm({ ...registerForm, level: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none cursor-pointer"
                          >
                            <option value="Beginner">Beginner (Learning Basics)</option>
                            <option value="Intermediate">Intermediate (Consistent Rallying)</option>
                            <option value="Advanced">Advanced (Competitive League)</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="text-xs uppercase tracking-wider text-gray-300 font-bold mb-1 d-block">
                            Membership Tier
                          </label>
                          <select
                            value={registerForm.membership}
                            onChange={(e) => setRegisterForm({ ...registerForm, membership: e.target.value })}
                            className="w-100 bg-[#242424] text-white border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:border-[#C6EF2E] focus:outline-none cursor-pointer font-bold text-[#C6EF2E]"
                          >
                            <option value="SILVER">Silver Member (10% Off)</option>
                            <option value="GOLD">Gold Member (20% Off)</option>
                            <option value="JUNIOR">Junior Member (15% Off)</option>
                          </select>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2 my-1">
                        <input
                          type="checkbox"
                          required
                          id="terms"
                          className="rounded text-[#C6EF2E] focus:ring-0 bg-[#242424] border-gray-700 mt-1 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer mb-0">
                          I agree to Adelux Padel Club rules, safety policies, and terms of service.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-accent w-100 justify-content-center py-3 mt-2"
                      >
                        {loading ? (
                          <span className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            Creating Account...
                          </span>
                        ) : (
                          <>
                            <span className="btn-title font-bold">Register Account</span>
                            <span className="icon-circle">
                              <i className="fa-solid fa-arrow-right"></i>
                            </span>
                          </>
                        )}
                      </button>

                      <div className="text-center mt-3 pt-3 border-top border-gray-800 text-xs text-gray-400">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            setStatusMessage(null);
                          }}
                          className="text-[#C6EF2E] font-bold bg-transparent border-0 cursor-pointer hover:underline"
                        >
                          Sign in here
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Quick Link back to Court Booking */}
            <div className="text-center mt-5">
              <Link
                to="/booking"
                className="text-gray-400 hover:text-[#C6EF2E] text-sm d-inline-flex align-items-center gap-2 transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
                <span>Explore Court Availability & Booking Without Signing In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
