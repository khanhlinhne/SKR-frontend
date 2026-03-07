import { motion } from 'motion/react';
import { Camera, Mail, Calendar as CalendarIcon, Star, Edit2, Settings } from 'lucide-react';

export default function ProfileHero({ userData, rank, isEditing, onToggleEditing, variants }) {
    return (
        <motion.div
            variants={variants}
            className="relative h-64 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 overflow-hidden"
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            />

            <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-7xl mx-auto flex items-end gap-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        className="relative group"
                    >
                        <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl bg-base-100">
                            <img
                                src="https://i.pravatar.cc/200?img=33"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute bottom-2 right-2 btn btn-circle btn-sm bg-white text-blue-600 border-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="w-4 h-4" />
                        </motion.button>
                    </motion.div>

                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white">{userData.name}</h1>
                            {userData.isPremium && (
                                <div className="badge bg-orange-500 border-none text-white font-bold gap-1 px-3 py-3">
                                    <Star className="w-3 h-3 fill-white" />
                                    Premium
                                </div>
                            )}
                            <div className="badge bg-purple-500 border-none text-white font-bold px-3 py-3">
                                {rank}
                            </div>
                        </div>
                        <p className="text-white/90 text-sm mb-3 max-w-2xl">{userData.bio}</p>
                        <div className="flex items-center gap-4 text-white/80 text-sm">
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {userData.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                Tham gia {userData.joinDate}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 pb-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleEditing}
                            className="btn bg-white text-blue-600 border-none font-bold rounded-xl hover:shadow-lg"
                        >
                            <Edit2 className="w-4 h-4" />
                            {isEditing ? 'Huy' : 'Chinh sua'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-ghost text-white border-white/30 hover:bg-white/10 font-bold rounded-xl"
                        >
                            <Settings className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
