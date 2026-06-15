import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAIL_DEMO, MAIL_KIT } from "../lib/landing-mailto";
import { Calendar, MapPin, ArrowRight, X, Menu } from 'lucide-react';
import { SAMPLE_EVENTS } from '../data/events';
import { Event, EventCategory, CATEGORY_LABELS } from '../types/event';

const LOGO = "/Braille%20bot%20%20Bio.png";

export function GalleryPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all");
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter events by category
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "all") {
      return SAMPLE_EVENTS;
    }
    return SAMPLE_EVENTS.filter(event => event.category === selectedCategory);
  }, [selectedCategory]);

  // Header scroll effect
  useEffect(() => {
    const controlHeader = () => {
      setScrolled(window.scrollY > 80);
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header - Responsive matching other pages */}
      <header className={`fixed top-0 w-full z-[100] px-4 sm:px-6 lg:px-16 py-3 sm:py-4 transition-all duration-500
        ${showHeader ? 'translate-y-0' : '-translate-y-full'}
        ${scrolled
          ? 'bg-white/95 backdrop-blur-md border-b shadow-sm'
          : 'bg-white border-b'}
      `} style={{ borderColor: '#e2e8f0' }}>
        
        <div className="flex justify-between items-center">
          <a className="flex items-center" href="/">
            <img
              src={LOGO}
              alt="BrailleEd Logo"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain transition-all cursor-pointer"
            />
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10" aria-label="Primary">
            <a href="/" className="text-xs font-bold uppercase tracking-widest transition text-slate-600 hover:text-[#0088ce]">
              Home
            </a>
            <a href="/#who-we-are" className="text-xs font-bold uppercase tracking-widest transition text-slate-600 hover:text-[#0088ce]">
              Who we are
            </a>
            <a href="/#purchase-kit" className="text-xs font-bold uppercase tracking-widest transition text-slate-600 hover:text-[#0088ce]">
              Purchase a kit
            </a>
            <a href="/evidence" className="text-xs font-bold uppercase tracking-widest transition text-slate-600 hover:text-[#0088ce]">
              User Evidence
            </a>
            <a href="/gallery" className="text-xs font-bold uppercase tracking-widest transition border-b-2 border-[#0088ce]" style={{ color: '#0088ce' }}>
              Events
            </a>
            
            <div className="flex items-center gap-3 xl:gap-4 ml-2 xl:ml-4">
              <a href={MAIL_DEMO} target='_blank' className="text-xs font-bold uppercase tracking-widest px-4 xl:px-6 py-2 xl:py-2.5 border-2 transition border-[#0088ce] text-[#0088ce] hover:bg-[#0088ce] hover:text-white rounded-md">
                Book a demo
              </a>
              <a href="/playground/" className="text-xs font-bold uppercase tracking-widest text-white px-4 xl:px-6 py-2 xl:py-2.5 transition rounded-md" style={{ backgroundColor: '#0088ce' }}>
                Open playground
              </a>
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md transition text-slate-600 hover:text-[#0088ce]"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50">
            <nav className="flex flex-col p-4 space-y-3" aria-label="Mobile navigation">
              <a href="/" onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-[#0088ce] transition py-2">Home</a>
              <a href="/#who-we-are" onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-[#0088ce] transition py-2">Who we are</a>
              <a href="/#purchase-kit" onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-[#0088ce] transition py-2">Purchase a kit</a>
              <a href="/evidence" onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-[#0088ce] transition py-2">User Evidence</a>
              <a href="/gallery" onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest text-[#0088ce] transition py-2">Events</a>
              <div className="border-t border-slate-200 my-2"></div>
              <a href={MAIL_DEMO} onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest border-2 border-[#0088ce] text-[#0088ce] px-4 py-2 text-center hover:bg-[#0088ce] hover:text-white transition rounded-md">Book a demo</a>
              <a href="/playground/" onClick={closeMobileMenu} className="text-sm font-bold uppercase tracking-widest text-white px-4 py-2 text-center rounded-md" style={{ backgroundColor: '#0088ce' }}>Open playground</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - White Background with Side-by-Side Layout */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 px-6 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left side - Title and description */}
            <div className="border-l-8 pl-8" style={{ borderColor: '#0088ce' }}>
              <p className="font-bold uppercase tracking-[0.3em] text-sm mb-4" style={{ color: '#0088ce' }}>
                Browse Our Impact
              </p>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 mb-4">
                Events
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                Explore our workshops, bootcamps, and classroom activities across Kenya.
              </p>
            </div>
            
            {/* Right side - Category Dropdown */}
            <div className="flex-shrink-0">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as EventCategory)}
                  className="appearance-none px-5 py-3 pr-10 rounded-lg border text-sm font-medium bg-white cursor-pointer focus:outline-none focus:ring-2 w-full sm:w-auto"
                  style={{ borderColor: '#e2e8f0', color: '#1e293b', minWidth: '200px' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0088ce'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <option value="all">All Categories</option>
                  <option value="workshop">Workshops</option>
                  <option value="bootcamp">Bootcamps</option>
                  <option value="classroom">Classroom Sessions</option>
                  <option value="special">Special Events</option>
                  <option value="student">Student Spotlights</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" style={{ color: '#0088ce' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 pb-24 px-6 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No events found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border"
                  style={{ borderColor: '#e2e8f0' }}
                >
                  <div className="relative overflow-hidden h-56 bg-slate-100">
                    <img
                      src={event.featuredImage}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90" style={{ color: '#0088ce' }}>
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                    </div>
                    <button className="text-sm font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2" style={{ color: '#0088ce' }}>
                      View Gallery <ArrowRight className="w-3 h-3 transition-all group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-16 text-center border-t pt-8" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-sm text-slate-500">
               Capturing moments of impact across Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <img src={LOGO} alt="BrailleEd" className="h-16 w-auto invert brightness-0" />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Robotics and coding for blind and visually impaired students in Kenya. Leading the way in inclusive STEM.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-6">Explore</h3>
            <ul className="space-y-3 text-sm font-medium uppercase tracking-widest text-gray-300">
              <li><a href="/playground/" className="hover:text-white transition">Playground</a></li>
              <li><a href="/gallery" className="hover:text-white transition">Events</a></li>
              <li><a href="/evidence" className="hover:text-white transition">User Evidence</a></li>
              <li><a href="/#who-we-are" className="hover:text-white transition">Who we are</a></li>
              <li><a href="/#purchase-kit" className="hover:text-white transition">Purchase a kit</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-6">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href={MAIL_KIT} className="hover:text-white transition">bunifuyouthskenya@gmail.com</a></li>
              <li><a href="tel:+254712015793" className="hover:text-white transition">0712 015793</a></li>
              <li className="pt-2 font-bold text-white uppercase tracking-widest text-xs">Based in Kenya</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">© {new Date().getFullYear()} BrailleEd · Bunifu Youths Kenya</p>
          <div className="flex gap-6 text-gray-500 text-xs uppercase tracking-widest">
            <span>Accessibility First</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}