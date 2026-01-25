import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import CourseShowcase from '../components/CourseShowcase';
import SmartFeatures from '../components/SmartFeatures';
import CountDown from '../components/CountDown';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

function Homepage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <NavBar />
            <Hero />
            <FeatureGrid />
            <CourseShowcase />
            <SmartFeatures />
            <CountDown />
            <Pricing />
            <Footer />
        </div>
    );
}

export default Homepage;