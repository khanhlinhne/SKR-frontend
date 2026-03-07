import { motion } from 'motion/react';
import { Camera, Mail, Calendar as CalendarIcon, Star, Edit2, Settings } from 'lucide-react';

export default function ProfileHero({ userData, rank, isEditing, onToggleEditing, variants }) {
    return (
        <motion.section variants={variants} className="border-b border-base-300 bg-base-100">
            <div className="mx-auto max-w-7xl px-8 pt-8 pb-6">
                <div className="relative overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.12),transparent_28%)]" />
                    <motion.div
                        animate={{ scale: [1, 1.12, 1], x: [0, 18, 0], y: [0, -12, 0] }}
                        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-16 left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1.08, 1, 1.08], x: [0, -20, 0], y: [0, 10, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute bottom-0 right-10 h-44 w-44 rounded-full bg-orange-400/10 blur-3xl"
                    />

                    <div className="relative p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                                <motion.div
                                    initial={{ scale: 0.94, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="group relative"
                                >
                                    <div className="h-32 w-32 overflow-hidden rounded-[28px] border-4 border-white/70 bg-base-100 shadow-xl">
                                        <img
                                            src="https://i.pravatar.cc/200?img=33"
                                            alt="Ảnh đại diện"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.96 }}
                                        className="btn btn-circle btn-sm absolute bottom-2 right-2 border-none bg-base-100 text-base-content shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </motion.button>
                                </motion.div>

                                <div className="pb-1">
                                    <div className="mb-3 flex flex-wrap items-center gap-3">
                                        <h1 className="text-4xl font-black tracking-tight text-base-content">{userData.name}</h1>
                                        {userData.isPremium && (
                                            <div className="badge border-none bg-amber-500/15 px-3 py-3 font-bold text-amber-700">
                                                <Star className="mr-1 h-3 w-3 fill-current" />
                                                Premium
                                            </div>
                                        )}
                                        <div className="badge border-none bg-violet-500/12 px-3 py-3 font-bold text-violet-700">
                                            {rank}
                                        </div>
                                    </div>
                                    <p className="max-w-3xl text-sm leading-7 text-base-content/70">{userData.bio}</p>
                                    <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-base-content/60">
                                        <span className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {userData.email}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            Tham gia {userData.joinDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 lg:pb-1">
                                <motion.button
                                    whileHover={{ y: -1, scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={onToggleEditing}
                                    className="btn rounded-2xl border-none bg-base-content px-5 font-bold text-base-100 shadow-lg"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -1, scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="btn rounded-2xl border border-base-300 bg-base-100 px-4 font-bold text-base-content shadow-sm hover:bg-base-200"
                                >
                                    <Settings className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
