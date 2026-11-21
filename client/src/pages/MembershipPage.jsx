import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../components/common/PageBanner';
import SubHeading from '../components/common/SubHeading';
import ScrollReveal from '../components/common/ScrollReveal';

const faqs = [
  {
    q: 'What are the benefits of becoming a member at Adelux Padel Club?',
    a: 'As a member, you gain exclusive court access, professional coaching sessions, priority in events and tournaments, special discounts, and become part of a vibrant and supportive padel community.',
  },
  {
    q: 'Can I cancel or change my membership tier at any time?',
    a: 'Yes! Memberships can be paused, upgraded, or cancelled at the end of each monthly billing cycle with zero cancellation fees.',
  },
  {
    q: 'Do members get guest passes for friends and family?',
    a: 'Standard and Elite members receive 2 complimentary guest passes each month to introduce new friends to Adelux courts.',
  },
  {
    q: 'Are coaching lessons included in the membership fee?',
    a: 'All plans include free monthly group training clinics. In addition, members enjoy up to 15% discount on all private 1-on-1 coaching packages.',
  },
];

export default function MembershipPage() {
  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <main>
      {/* Banner */}
      <PageBanner title="Join Our Club" current="Membership" bannerClass="banner-inner-membership" />

      {/* Membership Benefits Section */}
      <div className="section">
        <div className="hero-container overflow-hidden">
          <div className="row row-cols-xl-2 row-cols-1 grid-spacer-5 grid-spacer-xl-100">
            <div className="col order-2 order-xl-1">
              <div className="d-flex flex-column gspace-2">
                <div className="card card-benefit">
                  <div>
                    <div className="benefit-number">
                      <h4>01</h4>
                    </div>
                  </div>
                  <div className="d-flex flex-column gspace-2 text-center text-md-start">
                    <h4>Priority Court Access</h4>
                    <p>Book your favorite court slots in advance with real-time reservation privilege.</p>
                  </div>
                </div>

                <div className="card card-benefit">
                  <div>
                    <div className="benefit-number">
                      <h4>02</h4>
                    </div>
                  </div>
                  <div className="d-flex flex-column gspace-2 text-center text-md-start">
                    <h4>Free Group Access</h4>
                    <p>Join weekly training clinics and sharpen your skills alongside certified professionals.</p>
                  </div>
                </div>

                <div className="card card-benefit">
                  <div>
                    <div className="benefit-number">
                      <h4>03</h4>
                    </div>
                  </div>
                  <div className="d-flex flex-column gspace-2 text-center text-md-start">
                    <h4>Members Only Tournaments</h4>
                    <p>Compete in exclusive club leagues, cup championships, and social mixer tournaments.</p>
                  </div>
                </div>

                <div className="card card-benefit">
                  <div>
                    <div className="benefit-number">
                      <h4>04</h4>
                    </div>
                  </div>
                  <div className="d-flex flex-column gspace-2 text-center text-md-start">
                    <h4>Club Lounge Access</h4>
                    <p>Relax, connect, and network with fellow players in our modern air-conditioned lounge.</p>
                  </div>
                </div>

                <div className="card card-benefit">
                  <div>
                    <div className="benefit-number">
                      <h4>05</h4>
                    </div>
                  </div>
                  <div className="d-flex flex-column gspace-2 text-center text-md-start">
                    <h4>Special Discounts</h4>
                    <p>Enjoy up to 15% off pro shop gear, racket rentals, and personalized coaching packages.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col order-1 order-xl-2">
              <div className="d-flex flex-column gspace-2 text-center text-md-start">
                <SubHeading title="Why Join Adelux" />
                <h2>Be Part of an Exclusive Padel Community.</h2>
                <p>
                  Whether you're a beginner or a seasoned player, Adelux Padel Club offers a premium membership experience designed to elevate your game. Gain full access to world-class facilities, professional coaching, exclusive tournaments, and a vibrant community of padel enthusiasts.
                </p>
                <div className="image-container mt-4">
                  <img
                    src="/assets/images/multiracial-group-of-athletes-going-for-an-outdoor-ZAZBUZY-1024x683.jpg"
                    alt="Why Choose Us"
                    className="benefit-img rounded-2xl"
                  />
                  <div className="whychooseus-avatar-container">
                    <div className="d-flex flex-row align-items-center">
                      <img src="/assets/images/young-bearded-man-portrait-outdoors-in-the-mountai-6Z46ZMB.jpg" alt="Reviewer" className="banner-avatar" />
                      <img src="/assets/images/attractive-happy-woman-in-red-dress-smiling-outdoo-UW49SNL.jpg" alt="Reviewer" className="banner-avatar" />
                      <img src="/assets/images/close-up-of-young-man-smiling-outdoors-DELEX88.jpg" alt="Reviewer" className="banner-avatar" />
                    </div>
                    <div className="d-flex flex-column">
                      <div className="d-flex flex-row align-items-center gspace-1">
                        <h5 className="accent-color-2">25+</h5>
                        <h6 className="secondary-accent">Membership</h6>
                      </div>
                      <span className="chooseus-img-description">Enjoy our Facility</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="section-wrapper py-0">
        <div className="section section-pricing">
          <div className="hero-container overflow-hidden">
            <div className="d-flex flex-column gspace-5">
              <div className="heading-section-container pricing-heading">
                <SubHeading title="Membership Package" />
                <h2 className="secondary-accent">Choose the Membership that Fits your Goals</h2>
              </div>

              <div className="row row-cols-xl-3 row-cols-1 grid-spacer-2">
                {/* Basic Plan */}
                <div className="col">
                  <ScrollReveal animation="fade-up" delay={50}>
                    <div className="card card-pricing">
                      <div className="d-flex flex-row align-items-center justify-content-between">
                        <h4 className="secondary-accent">Basic</h4>
                        <div className="price-container d-flex align-items-baseline">
                          <h5 className="price-currency">$</h5>
                          <h3 className="price">29</h3>
                          <h6 className="pricing-details">/ Month</h6>
                        </div>
                      </div>
                      <p className="secondary-accent">Perfect for casual players who want to enjoy the court without commitment.</p>
                      <div className="underline-pricing"></div>
                      <ul className="pricing-benefit-list">
                        <li>4 Court Hours / Month</li>
                        <li>1 Group Training Session</li>
                        <li>Access to Community Events</li>
                        <li>Club Newsletter Subscription</li>
                        <li>Standard Booking Access</li>
                        <li>Member ID & Digital Pass</li>
                      </ul>
                      <div className="underline-pricing"></div>
                      <Link to="/register?tier=JUNIOR" className="btn btn-accent d-flex justify-content-between align-items-center w-100">
                        <span className="btn-title mx-auto text-center flex-grow-1">Join Basic</span>
                        <span className="icon-circle ms-auto">
                          <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </Link>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Standard Plan */}
                <div className="col">
                  <ScrollReveal animation="fade-up" delay={150}>
                    <div className="card card-pricing border-2 border-[#C6EF2E]">
                      <div className="d-flex flex-row align-items-center justify-content-between">
                        <h4 className="secondary-accent">Standard</h4>
                        <div className="price-container d-flex align-items-baseline">
                          <h5 className="price-currency">$</h5>
                          <h3 className="price">49</h3>
                          <h6 className="pricing-details">/ Month</h6>
                        </div>
                      </div>
                      <p className="secondary-accent">Ideal for regular players seeking balance between play and progress.</p>
                      <div className="underline-pricing"></div>
                      <ul className="pricing-benefit-list">
                        <li>8 Court Hours / Month</li>
                        <li>2 Group Training Sessions</li>
                        <li>Priority Court Booking</li>
                        <li>Access to Member-Only Tournaments</li>
                        <li>Community Forum Access</li>
                        <li>10% Off Coaching Packages</li>
                      </ul>
                      <div className="underline-pricing"></div>
                      <Link to="/register?tier=SILVER" className="btn btn-accent d-flex justify-content-between align-items-center w-100">
                        <span className="btn-title mx-auto text-center flex-grow-1">Join Standard</span>
                        <span className="icon-circle ms-auto">
                          <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </Link>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Elite Plan */}
                <div className="col">
                  <ScrollReveal animation="fade-up" delay={250}>
                    <div className="card card-pricing">
                      <div className="d-flex flex-row align-items-center justify-content-between">
                        <h4 className="secondary-accent">Elite</h4>
                        <div className="price-container d-flex align-items-baseline">
                          <h5 className="price-currency">$</h5>
                          <h3 className="price">89</h3>
                          <h6 className="pricing-details">/ Month</h6>
                        </div>
                      </div>
                      <p className="secondary-accent">For passionate padel players who want the full experience with exclusive benefits.</p>
                      <div className="underline-pricing"></div>
                      <ul className="pricing-benefit-list">
                        <li>Unlimited Court Access</li>
                        <li>4 Group Training Sessions</li>
                        <li>VIP Booking Priority</li>
                        <li>Exclusive Tournament Invitations</li>
                        <li>Access to Members Lounge</li>
                        <li>15% Off Merchandise & Coaching</li>
                      </ul>
                      <div className="underline-pricing"></div>
                      <Link to="/register?tier=GOLD" className="btn btn-accent d-flex justify-content-between align-items-center w-100">
                        <span className="btn-title mx-auto text-center flex-grow-1">Join Elite</span>
                        <span className="icon-circle ms-auto">
                          <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </Link>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="section">
        <div className="hero-container overflow-visible">
          <div className="row row-cols-xl-2 row-cols-1 grid-spacer-2">
            <div className="col col-xl-4">
              <div className="faq-title-container">
                <div className="d-flex flex-column gspace-2 text-center text-md-start">
                  <SubHeading title="Get Answer" />
                  <h2>Frequently Asked Questions</h2>
                </div>
              </div>
            </div>
            <div className="col col-xl-8">
              <div className="faq-wrapper d-flex flex-column gap-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="card p-4 bg-gray-50 border border-gray-200 cursor-pointer rounded-2xl"
                    onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="text-xl font-bold mb-0 text-gray-900">{faq.q}</h4>
                      <i
                        className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${
                          activeFaq === idx ? 'rotate-180 text-[#C6EF2E]' : 'text-gray-400'
                        }`}
                      ></i>
                    </div>
                    {activeFaq === idx && (
                      <p className="mt-3 text-gray-600 mb-0 leading-relaxed transition-all">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
