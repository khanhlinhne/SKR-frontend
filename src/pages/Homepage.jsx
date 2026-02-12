import { NavBar, Footer } from '../components/layout';
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
