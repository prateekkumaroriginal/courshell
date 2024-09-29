import ContactUs from "./ContactUs";
import Hero from "./Hero";
import LearningStats from "./Learning-stats";
import MostPopularCourses from "./MostPopularCourses";
import Navbar from "./Navbar";

function Landing() {
  return (
    <div>
      {/* navbar */}
      <div className="min-h-screen bg-purple-50">
        <Navbar />
        <Hero />
        <LearningStats />
        <MostPopularCourses />
        <ContactUs />
      </div>
    </div>
  );
}

export default Landing;
