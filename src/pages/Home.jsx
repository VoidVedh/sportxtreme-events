import Navbar       from "../components/Navbar";
import Hero         from "../components/Hero";
import About        from "../components/About";
import Services     from "../components/Services";
import Events       from "../components/Events";
import GalleryPreview from "../components/GalleryPreview";
import Contact      from "../components/Contact";
import Footer       from "../components/Footer";

export default function Home() {
  return (
    <div style={{ background: "#050505", color: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Events />
      <GalleryPreview />
      <Contact />
      <Footer />
    </div>
  );
}

