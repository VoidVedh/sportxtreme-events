/**
 * Central Content Configuration for SportXtreme Events
 * 
 * STRICT PRIVACY & CONTENT INTEGRITY RULE:
 * Every piece of information here is strictly sourced from verified repository assets
 * and existing database models. Any unverified field is null.
 * Never fabricate dates, prices, participant numbers, client logos, or testimonials.
 */

export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  (typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://sportxtreme.com");

export const SITE_CONFIG = {
  brand: {
    name: "SportXtreme Events",
    siteUrl: SITE_URL,
    tagline: "The Plan Behind The Play",
    logoUrl: "/sportxtreme-logo.jpg",
    logoAlt: "SportXtreme Events — The Plan Behind The Play",
  },

  contact: {
    primaryPhone: "+91 89765 71622",
    secondaryPhone: "+91 91368 90309",
    email: "sportxtremeevents@gmail.com",
    location: "Mumbai, Maharashtra",
    whatsappUrl: "https://wa.me/919136890309",
    // No unverified social handles:
    socialLinks: null,
  },

  navLinks: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Services", href: "/#services" },
    { label: "Process", href: "/#process" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/#contact" },
  ],

  hero: {
    headline: "MAKE EVERY MATCH MATTER",
    subheadline:
      "SportXtreme Events coordinates professional corporate sports leagues, marathons, school championships, tournaments, digital participant registrations, and on-ground gate operations.",
    ctaPrimary: {
      label: "EXPLORE EVENTS",
      href: "/events",
    },
    ctaSecondary: {
      label: "PLAN YOUR EVENT",
      href: "/#contact",
    },
  },

  services: [
    {
      id: "tournaments",
      icon: "🏆",
      title: "Tournament Planning & Management",
      desc: "End-to-end tournament orchestration — bracket generation, fixture scheduling, certified officiating, and match-day coordination for competitions of any scale.",
    },
    {
      id: "corporate",
      icon: "🏢",
      title: "Corporate Sports Leagues",
      desc: "Customized multi-sport leagues built for enterprises to cultivate team cohesion, wellness, inter-departmental collaboration, and athletic culture.",
    },
    {
      id: "schools",
      icon: "🎓",
      title: "School & College Championships",
      desc: "Youth sporting championships with structured rules, fair-play enforcement, and youth athletic recognition across cricket, football, and racquet sports.",
    },
    {
      id: "marathons",
      icon: "🏃",
      title: "Marathon & Mass Events",
      desc: "City and institutional runs equipped with digital ticketing, hydration hubs, route marshals, and comprehensive ground logistics.",
    },
    {
      id: "marketing",
      icon: "📢",
      title: "Sports Marketing",
      desc: "Strategic on-ground and digital visibility for sports properties, maximizing sponsor exposure, attendee engagement, and tournament prestige.",
    },
    {
      id: "venues",
      icon: "🏟️",
      title: "Venue & Gate Logistics",
      desc: "Venue selection, court setups, technical timing, and digital QR attendee check-ins for smooth crowd flow and verified gate entry.",
    },
  ],

  processSteps: [
    {
      step: "01",
      title: "BRIEF & DISCOVERY",
      desc: "We analyze your sporting objectives, target athlete scale, game categories, venue requirements, and timeline.",
    },
    {
      step: "02",
      title: "PLANNING & REGISTRATION",
      desc: "Detailed fixture design, rulebook standardization, digital attendee registration setup, and logistical provisioning.",
    },
    {
      step: "03",
      title: "EXECUTION & MANAGEMENT",
      desc: "Flawless on-ground delivery, match coordination, live QR gate verification, athlete support, and award ceremonies.",
    },
  ],

  leadership: [
    {
      name: "Ganesh Kamath",
      role: "Co-Founder",
      image: "/Ganesh Kamath Co-Founder.jpg",
      bio: "Leveraging years of competitive badminton experience to orchestrate world-class sporting events and player-first tournament operations.",
    },
    {
      name: "Harsh Pawar",
      role: "Co-Founder",
      image: "/Harsh Pawar Co-Founder.jpg",
      bio: "Fusing years of competitive cricket experience with sports management expertise to architect professional sporting experiences and leagues.",
    },
  ],
};
