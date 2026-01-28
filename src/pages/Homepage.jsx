import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import SmartFeatures from '../components/SmartFeatures';
import FeaturesSection from '../components/FeaturesSection';
import AudienceSection from '../components/AudienceSection';
import PricingSection from '../components/PricingSection';
import BlogSection from '../components/BlogSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import CourseShowcase from '../components/CourseShowcase';

function Homepage() {
    return (
        <div className="min-h-screen bg-base-100 font-sans text-base-content">
            <NavBar />
            <Hero />
            <SmartFeatures />
            <FeaturesSection />
            <AudienceSection />
            <PricingSection />
            <BlogSection />

            <CTASection />
            <Footer />
        </div>
    );
}

export default Homepage;
