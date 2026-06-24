import Navbar       from "../components/Navbar";
import Hero         from "../components/Hero";
import Stats        from "../components/Stats";
import About        from "../components/About";
import SportsUniverse from "../components/SportsUniverse";
import Services     from "../components/Services";
import EventJourney from "../components/EventJourney";
import Technology   from "../components/Technology";
import Events       from "../components/Events";
import Sponsors     from "../components/Sponsors";
import Testimonials from "../components/Testimonials";
import Contact      from "../components/Contact";
import Footer       from "../components/Footer";

// Ticker content
const TICKER_ITEMS = [
  "TOURNAMENT MANAGEMENT","CORPORATE LEAGUES","MARATHON EVENTS",
  "SCHOOL CHAMPIONSHIPS","LIVE SCORING","SPONSORSHIP",
  "VENUE MANAGEMENT","REGISTRATION",
];

function Ticker() {
  return (
    <div style={{ background: "#E50914", padding: "14px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", animation: "marquee 28s linear infinite" }}>
        {[0, 1].map((ri) => (
          <span key={ri} style={{ display: "inline-flex" }}>
            {TICKER_ITEMS.map((item, i) => (
              <span key={i} className="bebas" style={{ marginRight: 56, fontSize: "0.88rem", letterSpacing: "0.18em" }}>
                ⚡ {item}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: "#050505", color: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Ticker />
      <Stats />
      <About />
      <SportsUniverse />
      <Services />
      <EventJourney />
      <Technology />
      <Events />
      <Sponsors />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
