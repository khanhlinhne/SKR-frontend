import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeController from '@/shared/theme/ThemeController';

function FeatureCard({ feature, index }) {
    const FeatureIcon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 + index * 0.06 }}
            whileHover={{ y: -4 }}
            className="apple-auth-panel apple-transition rounded-[24px] p-5 backdrop-blur-xl"
        >
            <div className="apple-chip inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                <FeatureIcon className="apple-accent-text h-5 w-5" />
            </div>
            <h3 className="apple-main-text mt-4 text-base font-semibold tracking-[-0.02em]">{feature.title}</h3>
            <p className="apple-secondary-text mt-2 text-sm leading-6">{feature.description}</p>
        </motion.div>
    );
}

export default function AuthShell({
    badge,
    title,
    highlight,
    description,
    features = [],
    summaryTitle,
    summaryItems = [],
    contentWidthClassName = 'max-w-lg',
    children,
}) {
    return (
        <div className="apple-home min-h-screen overflow-hidden">
            <motion.div
                className="apple-hero-glow pointer-events-none absolute inset-x-0 top-[-8rem] h-[34rem]"
                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="apple-cta-glow pointer-events-none absolute bottom-[-8rem] left-[-6rem] h-[26rem] w-[26rem] rounded-full blur-3xl"
                animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />

            <header className="relative z-10 px-4 pt-4 sm:px-6 lg:px-8">
                <div className="apple-panel apple-transition mx-auto flex max-w-7xl items-center justify-between rounded-[24px] border px-5 py-4 backdrop-blur-xl">
                    <Link to="/" className="flex items-center gap-3" aria-label="Trang chủ SKR">
                        <div className="apple-solid-surface flex h-10 w-10 items-center justify-center rounded-full">
                            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
                        </div>
                        <div className="leading-tight">
                            <div className="apple-main-text text-[15px] font-semibold">SKR</div>
                            <div className="apple-secondary-text text-xs">Smart Knowledge Revise</div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="apple-auth-muted-link apple-transition hidden text-sm font-medium sm:inline-flex"
                        >
                            Về trang chủ
                        </Link>
                        <ThemeController className="apple-theme-toggle apple-transition" />
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 pb-12 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-10">
                <section className="hidden lg:block">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-2xl"
                    >
                        {badge ? (
                            <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl">
                                {badge}
                            </div>
                        ) : null}
                        <h1 className="apple-main-text mt-6 text-[3.4rem] font-semibold leading-[0.98] tracking-[-0.04em]">
                            {title}
                            {highlight ? (
                                <>
                                    <br />
                                    <span className="apple-highlight-text">{highlight}</span>
                                </>
                            ) : null}
                        </h1>
                        {description ? (
                            <p className="apple-secondary-text mt-6 max-w-xl text-lg leading-8">{description}</p>
                        ) : null}
                    </motion.div>

                    {features.length > 0 ? (
                        <div className="mt-10 grid gap-4 xl:grid-cols-2">
                            {features.map((feature, index) => (
                                <FeatureCard key={feature.title} feature={feature} index={index} />
                            ))}
                        </div>
                    ) : null}

                    {summaryItems.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.25 }}
                            className="apple-auth-panel mt-8 rounded-[28px] p-6 backdrop-blur-xl"
                        >
                            {summaryTitle ? (
                                <p className="apple-muted-text text-xs font-semibold uppercase tracking-[0.18em]">
                                    {summaryTitle}
                                </p>
                            ) : null}
                            <div className="mt-4 space-y-3">
                                {summaryItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="apple-panel apple-transition flex items-center justify-between rounded-2xl border px-4 py-3"
                                    >
                                        <span className="apple-secondary-text text-sm">{item.label}</span>
                                        <span className="apple-main-text text-sm font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : null}
                </section>

                <section className={`w-full ${contentWidthClassName} lg:justify-self-end`}>
                    {children}
                </section>
            </main>
        </div>
    );
}
