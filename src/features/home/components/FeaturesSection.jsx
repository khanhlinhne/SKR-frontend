import { motion } from 'motion/react';
import { featureCards } from '@/features/home/constants';

const toneStyles = {
    slate: 'apple-tone-slate',
    blue: 'apple-tone-blue',
    zinc: 'apple-tone-zinc',
    green: 'apple-tone-green',
};

export default function FeaturesSection({
    badge = 'Một trải nghiệm học tập liền mạch',
    titleMain = 'Mọi công cụ cần thiết',
    titleHighlight = 'để học hiệu quả hơn',
    subtitle = 'SKR kết hợp bài học, flashcards, quiz và AI trong một luồng rõ ràng để bạn tập trung vào việc học thay vì phải quản lý quá nhiều công cụ rời rạc.',
} = {}) {
    return (
        <section id="features" className="px-6 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="apple-badge inline-flex rounded-full px-4 py-2 text-sm font-medium backdrop-blur-xl">
                        {badge}
                    </div>
                    <h2 className="apple-main-text mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                        {titleMain}
                        <br />
                        <span className="apple-highlight-text">{titleHighlight}</span>
                    </h2>
                    <p className="apple-secondary-text mt-6 text-lg leading-8">{subtitle}</p>
                </motion.div>

                <div className="mt-14 grid gap-5 lg:grid-cols-12">
                    {featureCards.map((card, index) => {
                        const colSpan =
                            card.size === 'large'
                                ? 'lg:col-span-7'
                                : card.size === 'wide'
                                  ? 'lg:col-span-7'
                                  : 'lg:col-span-5';

                        return (
                            <motion.article
                                key={card.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -6, scale: 1.01 }}
                                className={`${colSpan} apple-card-shadow apple-transition overflow-hidden rounded-[32px] border p-7 sm:p-8 ${toneStyles[card.tone]}`}
                            >
                                <div className="flex h-full flex-col justify-between gap-10">
                                    <div>
                                        <motion.div
                                            whileHover={{ rotate: -6, scale: 1.04 }}
                                            className="apple-chip inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
                                        >
                                            <card.icon className="h-5 w-5" />
                                        </motion.div>
                                        <p className="apple-muted-text mt-6 text-xs font-semibold uppercase tracking-[0.18em]">
                                            {card.eyebrow}
                                        </p>
                                        <h3 className="apple-main-text mt-3 max-w-xl text-2xl font-semibold tracking-[-0.03em] sm:text-[2rem]">
                                            {card.title}
                                        </h3>
                                        <p className="apple-secondary-text mt-4 max-w-2xl text-base leading-7">
                                            {card.description}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {card.bullets.map((item, bulletIndex) => (
                                            <motion.div
                                                key={item}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: bulletIndex * 0.05 }}
                                                className="apple-panel apple-transition rounded-[24px] border px-4 py-4 text-sm leading-6 apple-secondary-text backdrop-blur-xl"
                                            >
                                                {item}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
