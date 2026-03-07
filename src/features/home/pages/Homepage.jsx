import { NavBar, Footer } from '@/shared/layout';
import {
    Hero,
    SmartFeatures,
    FeaturesSection,
    AudienceSection,
    ExpertCoursesSection,
    PricingSection,
    BlogSection,
    CTASection
} from '@/features/home/components';

function loadHomepageSection(storageKey) {
    try {
        const savedValue = localStorage.getItem(storageKey);
        return savedValue ? JSON.parse(savedValue) : {};
    } catch (error) {
        console.error('Failed to load homepage settings from localStorage', error);
        return {};
    }
}

function Homepage() {
    const heroData = loadHomepageSection('skr_homepage_hero');
    const featuresData = loadHomepageSection('skr_homepage_features');
    const expertsData = loadHomepageSection('skr_homepage_experts');

    return (
        <div className="min-h-screen bg-base-100 font-sans text-base-content">
            <NavBar />
            <Hero {...heroData} />
            <SmartFeatures />
            <FeaturesSection {...featuresData} />
            <AudienceSection />
            <ExpertCoursesSection {...expertsData} />
            <PricingSection />
            <BlogSection />
            <CTASection />
            <Footer />
        </div>
    );
}

export default Homepage;
