import NavBar from '../components/NavBar';
import {
    Hero,
    SmartFeatures,
    FeaturesSection,
    AudienceSection,
    ExpertCoursesSection,
    PricingSection,
    BlogSection,
    CTASection
} from '../components/homepage';
import Footer from '../components/Footer';

function Homepage() {
    return (
        <div className="min-h-screen bg-base-100 font-sans text-base-content">
            <NavBar />
            <Hero />
            <SmartFeatures />
            <FeaturesSection />
            <AudienceSection />
            <ExpertCoursesSection />
            <PricingSection />
            <BlogSection />

            <CTASection />
            <Footer />
        </div>
    );
}

export default Homepage;
