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
    desc: "From cricket pitches to football grounds — we orchestrate outdoor competitions with national-level precision and passion.",
    list: ["Cricket", "Football", "Basketball", "Tennis", "Pickleball"],
  },
  indoor: {
    label: "Indoor Sports",
    emoji: "🏸",
    desc: "Precision, skill, and mental fortitude. Elite indoor competition in perfectly managed, climate-controlled environments.",
    list: ["Badminton", "Table Tennis", "Chess", "Carrom", "Squash"],
  },
  aquatic: {
    label: "Aquatic Sports",
    emoji: "🏊",
    desc: "Professional aquatic events with international timing systems, robust safety protocols, and spectacular spectator setups.",
    list: ["Swimming", "Aqua Fitness", "Aqua Zumba"],
  },
  largescale: {
    label: "Large Scale Events",
    emoji: "🏃",
    desc: "Mass participation events uniting thousands of athletes — meticulously planned from start line to finish line.",
    list: ["Marathon", "Half Marathon", "Walkathon", "Cyclothon", "Relay Events"],
  },
};

// ─── SERVICES ────────────────────────────────────────────────────────────────
export const SERVICES = [
  { icon: "🏆", title: "Tournament Planning & Management", desc: "End-to-end organization — brackets, scheduling, officiating, and real-time results for tournaments of any scale." },
  { icon: "🏢", title: "Corporate Sports Leagues",          desc: "Customized leagues building team spirit, healthy competition, and brand culture across organizations." },
  { icon: "🎓", title: "School & College Championships",    desc: "Youth programs designed to identify, nurture, and celebrate the next generation of Indian champions." },
  { icon: "🏃", title: "Marathon & Mass Events",            desc: "City-scale events with chip timing, hydration stations, safety marshals, and full logistical support." },
  { icon: "📢", title: "Sports Marketing",                  desc: "360° marketing solutions maximizing event visibility, digital reach, and sponsor value." },
  { icon: "🏟️", title: "Venue Management",                  desc: "Expert venue selection, setup, logistics, and management for events of any scale." },
  { icon: "📊", title: "Live Scoring",                      desc: "Real-time digital scoreboards and display systems for immersive on-ground and remote fan experiences." },
  { icon: "📝", title: "Registration Management",           desc: "Seamless online and offline registration flows with integrated payment gateways." },
  { icon: "🤝", title: "Sponsorship Management",            desc: "Strategic sponsor acquisition, activation, and relationship management for maximum ROI." },
];

// ─── EVENT JOURNEY STEPS ─────────────────────────────────────────────────────
export const JOURNEY = [
  { n: "01", title: "CONCEPT",      desc: "Your vision, our blueprint" },
  { n: "02", title: "PLANNING",     desc: "Strategy meets execution" },
  { n: "03", title: "REGISTRATION", desc: "Seamless participant onboarding" },
  { n: "04", title: "EXECUTION",    desc: "Flawless on-ground delivery" },
  { n: "05", title: "LIVE SCORING", desc: "Real-time results & updates" },
  { n: "06", title: "AWARDS",       desc: "Celebrating excellence" },
  { n: "07", title: "ANALYTICS",    desc: "Data-driven post-event insights" },
];

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  { name: "Vikram Mehta",  role: "VP Operations, TechCorp India",                  text: "SportXtreme transformed our annual corporate games into a world-class event. Their execution was flawless — every single detail accounted for.", stars: 5 },
  { name: "Priya Sharma",  role: "Sports Director, Mumbai Schools Association",    text: "The school championship they organized was the most professionally run youth sporting event we have ever witnessed in the city.",               stars: 5 },
  { name: "Rahul Nair",    role: "Marathon Participant & Running Club Lead",        text: "From registration to the finish line, every detail was perfect. This is what world-class event management looks like in India.",                stars: 5 },
];

// ─── EVENT SHOWCASE ───────────────────────────────────────────────────────────
export const EVENTS = [
  { cat: "CORPORATE", title: "Mumbai Corporate Cricket League",  n: "500+",   sport: "Cricket",    ed: "4th Edition", emoji: "🏏" },
  { cat: "MARATHON",  title: "SportXtreme City Marathon 2025",  n: "2,500+", sport: "Running",    ed: "2nd Edition", emoji: "🏃" },
  { cat: "SCHOOL",    title: "Inter-School Sports Championship", n: "1,200+", sport: "Multi-Sport",ed: "Annual",      emoji: "🎓" },
  { cat: "LEAGUE",    title: "Football Super League Mumbai",     n: "800+",   sport: "Football",   ed: "3rd Season",  emoji: "⚽" },
  { cat: "CYCLING",   title: "Western Mumbai Cyclothon",         n: "3,000+", sport: "Cycling",    ed: "Inaugural",   emoji: "🚴" },
  { cat: "AQUATIC",   title: "Corporate Swim Challenge",         n: "400+",   sport: "Swimming",   ed: "2nd Edition", emoji: "🏊" },
];

// ─── WHY SPORTXTREME ─────────────────────────────────────────────────────────
export const WHY_ITEMS = [
  { icon: "🎯", title: "Professional Execution", desc: "Military-grade planning with athlete-first delivery. Every minute of your event is accounted for." },
  { icon: "💻", title: "Technology Driven",       desc: "QR check-ins, live scoring, digital certificates, and real-time analytics at every event." },
  { icon: "🛡️", title: "Safety First",             desc: "Trained safety personnel, medical support, and risk management protocols in place always." },
  { icon: "🏆", title: "National Level Standards", desc: "Events organized to national federation standards, ensuring credibility and trust." },
  { icon: "🤝", title: "Sponsor Friendly",         desc: "Maximum brand visibility with strategic on-ground placement and comprehensive digital reach." },
  { icon: "⚡", title: "Athlete Focused",           desc: "From registration to medals, every touchpoint is designed to honor the athlete's experience." },
];

// ─── TECHNOLOGY FEATURES ─────────────────────────────────────────────────────
export const TECH_FEATURES = [
  { icon: "📱", title: "Online Registration", desc: "Integrated registration with payment gateway, custom forms, and instant confirmation.", hot: true },
  { icon: "📷", title: "QR Check-In",         desc: "Instant participant verification via QR code scanning at event entry gates." },
  { icon: "📊", title: "Live Scoring",         desc: "Real-time score updates visible to participants, spectators, and remote viewers." },
  { icon: "🏅", title: "Live Leaderboards",    desc: "Dynamic leaderboards that update in real-time as events progress and scores change." },
  { icon: "🎓", title: "Digital Certificates", desc: "Instantly generated and emailed digital certificates for all participants and winners." },
  { icon: "📈", title: "Analytics Dashboard",  desc: "Post-event data insights on participation, performance, and sponsor exposure metrics." },
];

// ─── SPONSOR BENEFITS ────────────────────────────────────────────────────────
export const SPONSOR_BENEFITS = [
  { icon: "📢", title: "Brand Visibility",     desc: "Your brand at the center — banners, jerseys, digital screens, and immersive on-ground presence." },
  { icon: "🎯", title: "Lead Generation",       desc: "Direct access to thousands of engaged sport enthusiasts and corporate decision-makers." },
  { icon: "🤝", title: "Community Reach",       desc: "Build genuine brand affinity through meaningful sports engagement and shared values." },
  { icon: "📍", title: "On-ground Branding",    desc: "Activation zones, stalls, and experiential marketing integrated into every event." },
  { icon: "📊", title: "Post Event Analytics",  desc: "Detailed reports on reach, impressions, and ROI metrics after every event closes." },
  { icon: "💰", title: "Sponsor ROI",           desc: "Transparent measurement of sponsor value through quantified reach and activation data." },
];

// ─── CONTACT INFO ─────────────────────────────────────────────────────────────
export const CONTACT_INFO = [
  { icon: "📞", label: "Call Us",   val: "+91 8976571622\n+91 9136890309" },
  { icon: "✉️", label: "Email",     val: "sportxtremeevents@gmail.com" },
  { icon: "📍", label: "Location",  val: "Mumbai, Maharashtra, India" },
];
