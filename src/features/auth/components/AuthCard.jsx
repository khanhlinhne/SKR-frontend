import { motion } from 'motion/react';

export default function AuthCard({ eyebrow, title, subtitle, children, footer }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="apple-auth-card apple-transition relative overflow-hidden rounded-[32px] p-8 sm:p-10 backdrop-blur-2xl"
        >
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0a84ff_0%,#6e5dff_55%,#8b5cf6_100%)]" />
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(10,132,255,0.16),transparent_68%)] blur-3xl" />

            {(eyebrow || title || subtitle) && (
                <div className="relative mb-8">
                    {eyebrow ? (
                        <div className="apple-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-xl">
                            {eyebrow}
                        </div>
                    ) : null}
                    {title ? <h2 className="apple-main-text mt-5 text-3xl font-semibold tracking-[-0.03em]">{title}</h2> : null}
                    {subtitle ? <p className="apple-secondary-text mt-3 text-sm leading-7 sm:text-base">{subtitle}</p> : null}
                </div>
            )}

            <div className="relative">{children}</div>

            {footer ? <div className="relative mt-8 border-t apple-border pt-6">{footer}</div> : null}
        </motion.section>
    );
}
