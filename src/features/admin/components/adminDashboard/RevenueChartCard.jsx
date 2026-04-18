import { motion } from 'motion/react';
import { formatCompactCurrencyVND } from '@/features/admin/utils/adminDashboardData';
import { cardVariants, EmptyState, SectionLoading } from './shared';

export default function RevenueChartCard({ data, ui, loading }) {
    const maxRevenue = Math.max(...data.map((item) => item.revenue), 0);

    return (
        <motion.div variants={cardVariants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-lg font-black text-base-content">{ui?.title || 'Biểu đồ Doanh thu'}</h3>
                    <p className="text-sm text-base-content/60">{ui?.subtitle || 'Dữ liệu doanh thu từ dashboard thực tế'}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                        {ui?.legendLabel || 'Doanh thu'}
                    </span>
                </div>
            </div>

            {loading && data.length === 0 ? (
                <SectionLoading />
            ) : data.length === 0 ? (
                <EmptyState message="Chưa có dữ liệu doanh thu." />
            ) : (
                <div className="relative px-1">
                    <div className="flex items-end gap-2" style={{ height: '192px' }}>
                        {data.map((item, index) => {
                            const heightPx = maxRevenue > 0
                                ? Math.max(8, Math.round((item.revenue / (maxRevenue * 1.15)) * 180))
                                : 0;
                            const isHighlighted = index === data.length - 1;

                            return (
                                <div key={`${item.month}-${index}`} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                                    <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-base-content px-2.5 py-1 text-[10px] font-bold text-base-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                        {item.displayAmount || formatCompactCurrencyVND(item.revenue)}
                                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-base-content" />
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: heightPx }}
                                        transition={{ delay: 0.35 + index * 0.05, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className={`w-full rounded-t-lg transition-colors ${
                                            isHighlighted
                                                ? 'bg-gradient-to-t from-emerald-600 to-cyan-500 shadow-lg'
                                                : 'bg-emerald-500/30 group-hover:bg-emerald-500/60'
                                        }`}
                                        style={{ minHeight: heightPx > 0 ? '4px' : '0' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-2 flex gap-2">
                        {data.map((item, index) => (
                            <div key={`${item.month}-label-${index}`} className="flex-1 text-center">
                                <span className="text-[10px] font-bold text-base-content/50">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
