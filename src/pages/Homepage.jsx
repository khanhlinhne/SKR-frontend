import { useState, useEffect } from 'react';
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
    const [heroData, setHeroData] = useState({});
    const [featuresData, setFeaturesData] = useState({});
    const [expertsData, setExpertsData] = useState({});

    useEffect(() => {
        try {
            const savedHero = localStorage.getItem('skr_homepage_hero');
            if (savedHero) setHeroData(JSON.parse(savedHero));

            const savedFeatures = localStorage.getItem('skr_homepage_features');
            if (savedFeatures) setFeaturesData(JSON.parse(savedFeatures));

            const savedExperts = localStorage.getItem('skr_homepage_experts');
            if (savedExperts) setExpertsData(JSON.parse(savedExperts));
        } catch (e) {
            console.error("Failed to load settings from localStorage", e);
        }
    }, []);

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
