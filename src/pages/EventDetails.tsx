import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MAIL_DEMO, MAIL_KIT } from "../lib/landing-mailto";
import { Calendar, MapPin, ArrowLeft, X, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { SAMPLE_EVENTS } from '../data/events';
import { Event } from '../types/event';

const LOGO = "/Braille%20bot%20%20Bio.png";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load event data
  useEffect(() => {
    const foundEvent = SAMPLE_EVENTS.find(e => e.id === parseInt(id || "0"));
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      navigate('/gallery');
    }
  }, [id, navigate]);

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

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentPhotoIndex]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevPhoto = () => {
    if (event && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (event && currentPhotoIndex < event.galleryImages.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
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
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain transition-all cursor-pointer"
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

      {/* Back Button */}
      <div className="pt-50 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 text-sm font-semibold transition-colors mb-6"
            style={{ color: '#0088ce' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>
      </div>

      {/* Event Hero */}
      <section className="px-6 lg:px-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-8 pl-8" style={{ borderColor: '#0088ce' }}>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 inline-block mb-4" style={{ color: '#0088ce' }}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900 mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event.date}
              </span>
            </div>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-6 lg:px-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={event.featuredImage}
              alt={event.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="px-6 lg:px-24 pb-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-6 pl-8 border-l-8" style={{ borderColor: '#0088ce' }}>
            Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.galleryImages.map((image, index) => (
              <div
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-slate-100"
              >
                <img
                  src={image}
                  alt={`${event.title} - ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-bold uppercase tracking-wider transition-opacity">
                    Click to view
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && event && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-white text-4xl hover:text-[#0088ce] transition z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={handlePrevPhoto}
            className={`absolute left-5 text-white text-3xl hover:text-[#0088ce] transition ${currentPhotoIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={currentPhotoIndex === 0}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <img
            src={event.galleryImages[currentPhotoIndex]}
            alt={`${event.title} - ${currentPhotoIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />
          
          <button
            onClick={handleNextPhoto}
            className={`absolute right-5 text-white text-3xl hover:text-[#0088ce] transition ${currentPhotoIndex === event.galleryImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={currentPhotoIndex === event.galleryImages.length - 1}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          
          <div className="absolute bottom-5 left-0 right-0 text-center text-white">
            <p className="text-sm text-white/70">
              {currentPhotoIndex + 1} / {event.galleryImages.length}
            </p>
          </div>
        </div>
      )}

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
              <li><a href="/evidence" className="hover:text-white transition">User Evidence</a></li>
              <li><a href="/gallery" className="hover:text-white transition">Events</a></li>
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