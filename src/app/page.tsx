import NavBar from "@/app/LandingPage/NavBar";
import Hero from "@/app/LandingPage/Hero";
import Features from "@/app/LandingPage/Features";
import UpcomingEvents from "@/app/LandingPage/UpcomingEvents";
import Stats from "@/app/LandingPage/Stats";
// import Testimonials from "@/app/LandingPage/Testimonials";
import CallToAction from "@/app/LandingPage/CallToAction";
import Footer from "@/app/LandingPage/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <Hero />
      <Features />
      <UpcomingEvents />
      <Stats />
      {/* <Testimonials /> */}
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;