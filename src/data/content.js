// ─── COLOUR TOKENS ───────────────────────────────────────────────────────────
export const C = {
  black:  "#050505",
  red:    "#E50914",
  white:  "#FFFFFF",
  gray:   "#A1A1AA",
  dark:   "#0d0d0d",
  border: "rgba(255,255,255,0.06)",
};

// ─── SPORTS CATEGORIES ───────────────────────────────────────────────────────
export const SPORTS_CATS = {
  outdoor: {
    label: "Outdoor Sports",
    emoji: "⚽",
    desc: "From cricket pitches to football grounds — we orchestrate outdoor competitions with professional precision and passion.",
    list: ["Cricket", "Football", "Team Events"],
  },
  indoor: {
    label: "Indoor Sports",
    emoji: "🏸",
    desc: "Precision, skill, and mental fortitude. Indoor competition in professionally managed environments.",
    list: ["Badminton", "Table Tennis", "Chess", "Carrom", "Squash"],
  },
  aquatic: {
    label: "Aquatic Sports",
    emoji: "🏊",
    desc: "Water sports events with proper timing systems, robust safety protocols, and spectator setups.",
    list: ["Swimming"],
  },
  largescale: {
    label: "Large Scale Events",
    emoji: "🏃",
    desc: "Mass participation events uniting athletes — planned step-by-step from start line to finish line.",
    list: ["Marathon"],
  },
};

// ─── SERVICES ────────────────────────────────────────────────────────────────
export const SERVICES = [
  { icon: "🏆", title: "Tournament Planning & Management", desc: "End-to-end organization — brackets, scheduling, officiating, and coordination for tournaments of any scale." },
  { icon: "🏢", title: "Corporate Sports Leagues",          desc: "Customized leagues building team spirit, healthy competition, and brand culture across organizations." },
  { icon: "🎓", title: "School & College Championships",    desc: "Youth programs designed to celebrate and promote sports and physical education among students." },
  { icon: "🏃", title: "Marathon & Mass Events",            desc: "City-scale events with dynamic check-ins, hydration stations, safety marshals, and full logistical support." },
  { icon: "📢", title: "Sports Marketing",                  desc: "Strategic marketing solutions maximizing event visibility, digital reach, and sponsor value." },
  { icon: "🏟️", title: "Venue Management",                  desc: "Expert venue selection, setup, logistics, and management for events of any scale." },
  { icon: "📝", title: "Registration Management",           desc: "Seamless online registration flows with integrated ticket generation." },
  { icon: "🤝", title: "Sponsorship Management",            desc: "Sponsor activation and relationship management for maximum event support." },
];

// ─── EVENT JOURNEY STEPS ─────────────────────────────────────────────────────
export const JOURNEY = [
  { n: "01", title: "CONCEPT",      desc: "Your vision, our blueprint" },
  { n: "02", title: "PLANNING",     desc: "Strategy meets execution" },
  { n: "03", title: "REGISTRATION", desc: "Seamless participant onboarding" },
  { n: "04", title: "EXECUTION",    desc: "Flawless on-ground delivery" },
  { n: "05", title: "AWARDS",       desc: "Celebrating excellence" },
];

// ─── TESTIMONIALS (RESOLVED BY DATABASE ONLY) ─────────────────────────────────
export const TESTIMONIALS = [];

// ─── EVENT SHOWCASE (RESOLVED BY DATABASE ONLY) ───────────────────────────────
export const EVENTS = [];

// ─── WHY SPORTXTREME ─────────────────────────────────────────────────────────
export const WHY_ITEMS = [
  { icon: "🎯", title: "Professional Execution", desc: "Meticulous planning with athlete-first delivery. Every detail of your event is accounted for." },
  { icon: "💻", title: "Technology Driven",       desc: "Secure online registration and QR gate check-ins at every event." },
  { icon: "🛡️", title: "Safety First",             desc: "Trained safety personnel, medical support, and risk management protocols in place always." },
  { icon: "🏆", title: "Quality Standards",       desc: "Events organized with strict adherence to sporting guidelines, ensuring credibility." },
  { icon: "🤝", title: "Sponsor Friendly",         desc: "Maximum brand visibility with strategic on-ground placement and digital reach." },
  { icon: "⚡", title: "Athlete Focused",           desc: "From registration to medals, every touchpoint is designed to honor the athlete's experience." },
];

// ─── TECHNOLOGY FEATURES ─────────────────────────────────────────────────────
export const TECH_FEATURES = [
  { icon: "📱", title: "Online Registration", desc: "Integrated registration with custom forms, age verification, and instant ticket confirmation.", hot: true },
  { icon: "📷", title: "QR Check-In",         desc: "Instant participant verification via QR code scanning at event entry gates." },
];

// ─── SPONSOR BENEFITS ────────────────────────────────────────────────────────
export const SPONSOR_BENEFITS = [
  { icon: "📢", title: "Brand Visibility",     desc: "Your brand at the center — banners, jerseys, digital screens, and immersive on-ground presence." },
  { icon: "🎯", title: "Lead Generation",       desc: "Direct access to engaged sport enthusiasts and corporate decision-makers." },
  { icon: "🤝", title: "Community Reach",       desc: "Build genuine brand affinity through meaningful sports engagement and shared values." },
  { icon: "📍", title: "On-ground Branding",    desc: "Activation zones, stalls, and experiential marketing integrated into every event." },
  { icon: "💰", title: "Sponsor ROI",           desc: "Measurement of sponsor value through quantified reach and activation data." },
];

// ─── CONTACT INFO ─────────────────────────────────────────────────────────────
export const CONTACT_INFO = [
  { icon: "📞", label: "Call Us",   val: "+91 89765 71622\n+91 91368 90309" },
  { icon: "✉️", label: "Email",     val: "sportxtremeevents@gmail.com" },
  { icon: "📍", label: "Location",  val: "Mumbai, Maharashtra" },
];
