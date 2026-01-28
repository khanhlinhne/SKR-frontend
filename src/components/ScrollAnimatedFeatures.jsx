import * as motion from "motion/react-client";

export default function ScrollAnimatedFeatures() {
    return (
        <section className="py-24 bg-base-100 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-bold text-base-content mb-4">
                        Everything you need to{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            succeed
                        </span>
                    </h2>
                    <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
                        Powerful features designed to streamline your workflow
                    </p>
                </div>

                {/* Animated Cards */}
                <div className="max-w-2xl mx-auto pb-20">
                    {features.map(([icon, title, description, hueA, hueB], i) => (
                        <FeatureCard
                            key={title}
                            i={i}
                            icon={icon}
                            title={title}
                            description={description}
                            hueA={hueA}
                            hueB={hueB}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, description, hueA, hueB, i }) {
    const background = `linear-gradient(306deg, ${hue(hueA)}, ${hue(hueB)})`;

    const cardVariants = {
        offscreen: {
            y: 300,
            opacity: 0,
        },
        onscreen: {
            y: 50,
            opacity: 1,
            rotate: i % 2 === 0 ? -3 : 3,
            transition: {
                type: "spring",
                bounce: 0.4,
                duration: 0.8,
            },
        },
    };

    return (
        <motion.div
            className="relative overflow-hidden flex justify-center items-center pt-5 -mb-32"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.8, once: false }}
        >
            {/* Background splash */}
            <div
                className="absolute inset-0"
                style={{
                    background,
                    clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
                }}
            />

            {/* Card */}
            <motion.div
                variants={cardVariants}
                className="relative w-full max-w-md h-[430px] flex flex-col justify-center items-center rounded-3xl bg-base-100 shadow-2xl p-8"
                style={{
                    transformOrigin: "10% 60%",
                    boxShadow:
                        "0 0 1px hsl(0deg 0% 0% / 0.075), 0 0 2px hsl(0deg 0% 0% / 0.075), 0 0 4px hsl(0deg 0% 0% / 0.075), 0 0 8px hsl(0deg 0% 0% / 0.075), 0 0 16px hsl(0deg 0% 0% / 0.075)",
                }}
            >
                {/* Icon */}
                <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                    style={{ background }}
                >
                    <span className="text-5xl">{icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-3xl font-bold text-base-content mb-4 text-center">
                    {title}
                </h3>
                <p className="text-base-content/70 text-center leading-relaxed text-lg">
                    {description}
                </p>

                {/* Decorative corner */}
                <div
                    className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30"
                    style={{ background }}
                />
            </motion.div>
        </motion.div>
    );
}

const hue = (h) => `hsl(${h}, 100%, 50%)`;

/**
 * ==============   Data   ================
 */

const features = [
    [
        "⚡",
        "Lightning Fast",
        "Built for speed with optimized performance that keeps your workflow moving at the pace of your ideas.",
        60,
        90,
    ],
    [
        "🎯",
        "Laser Focused",
        "Stay on target with smart task management and intelligent prioritization that adapts to your needs.",
        340,
        10,
    ],
    [
        "🚀",
        "Scale Effortlessly",
        "Grow your business without growing pains. Our platform scales seamlessly as you expand.",
        205,
        245,
    ],
    [
        "🔒",
        "Bank-Level Security",
        "Your data is protected with enterprise-grade encryption and security protocols you can trust.",
        260,
        290,
    ],
    [
        "🎨",
        "Beautiful Design",
        "Gorgeous interfaces that make work feel less like work and more like a creative experience.",
        290,
        320,
    ],
    [
        "🤝",
        "Team Collaboration",
        "Work together seamlessly with real-time updates and powerful collaboration tools.",
        100,
        140,
    ],
];
