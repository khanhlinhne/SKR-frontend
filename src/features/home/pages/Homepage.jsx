import { Hero, FeaturesSection, ExpertCoursesSection, PricingSection, CTASection, HomeNavBar, HomeFooter } from '@/features/home/components';

function hasBrokenEncoding(value) {
    if (typeof value === 'string') {
        return /Ã|Ä|á»|áº|Â|Æ°|Æ¡/.test(value);
    }

    if (Array.isArray(value)) {
        return value.some(hasBrokenEncoding);
    }

    if (value && typeof value === 'object') {
        return Object.values(value).some(hasBrokenEncoding);
    }

    return false;
}

function loadHomepageSection(storageKey) {
    try {
        const savedValue = localStorage.getItem(storageKey);
        if (!savedValue) {
            return {};
        }

        const parsedValue = JSON.parse(savedValue);
        return hasBrokenEncoding(parsedValue) ? {} : parsedValue;
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
        <div className="apple-home apple-transition min-h-screen">
            <HomeNavBar />
            <Hero {...heroData} />
            <FeaturesSection {...featuresData} />
            <ExpertCoursesSection {...expertsData} />
            <PricingSection />
            <CTASection />
            <HomeFooter />
        </div>
    );
}

export default Homepage;
