import { useState } from 'react';
import { motion } from 'motion/react';
import {
    Play,
    Pause,
    Maximize,
    Volume2,
    VolumeX,
    SkipForward,
    SkipBack,
    Settings,
    Monitor
} from 'lucide-react';

/**
 * LearnVideoPlayer - Video player with Apple-style controls
 * Renders a simulated premium video player with overlay controls.
 *
 * @param {object}  lesson     - Current lesson object
 * @param {string}  gradient   - Course gradient class
 * @param {boolean} isPlaying  - Whether the video is playing
 * @param {Function} onTogglePlay - Callback to toggle play/pause
 */
export default function LearnVideoPlayer({
    lesson,
    gradient = 'from-blue-500 to-violet-500',
    isPlaying = false,
    onTogglePlay,
}) {
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const currentTime = 0;
    const duration = (lesson?.durationMinutes || 25) * 60; // seconds
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-video bg-gray-950 rounded-2xl overflow-hidden group shadow-2xl"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => !isPlaying && setShowControls(true)}
        >
            {/* Video placeholder / thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Gradient background simulating video */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }}
                />

                {/* Centered play button */}
                {!isPlaying && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={onTogglePlay}
                        className={`z-10 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl hover:scale-105 transition-transform`}
                    >
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </motion.button>
                )}

                {/* Video content area — shows lesson title when not playing */}
                {!isPlaying && (
                    <div className="absolute bottom-20 left-0 right-0 text-center">
                        <p className="text-white/40 text-sm font-medium">
                            {lesson?.title}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom controls overlay */}
            <motion.div
                initial={false}
                animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-5"
            >
                {/* Progress bar */}
                <div className="mb-3 group/progress cursor-pointer">
                    <div className="relative h-1 group-hover/progress:h-1.5 transition-all rounded-full bg-white/20 overflow-hidden">
                        {/* Buffered */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
                            style={{ width: `${Math.min(progress + 15, 100)}%` }}
                        />
                        {/* Played */}
                        <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient}`}
                            style={{ width: `${progress}%` }}
                        />
                        {/* Scrubber dot */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
                        />
                    </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={onTogglePlay}
                            className="text-white/90 hover:text-white transition-colors"
                        >
                            {isPlaying
                                ? <Pause className="w-5 h-5" />
                                : <Play className="w-5 h-5" fill="white" />
                            }
                        </button>

                        {/* Skip */}
                        <button className="text-white/60 hover:text-white transition-colors">
                            <SkipBack className="w-4 h-4" />
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <SkipForward className="w-4 h-4" />
                        </button>

                        {/* Volume */}
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            {isMuted
                                ? <VolumeX className="w-4 h-4" />
                                : <Volume2 className="w-4 h-4" />
                            }
                        </button>

                        {/* Time */}
                        <span className="text-white/60 text-xs font-medium ml-1">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Speed */}
                        <button className="text-white/60 hover:text-white transition-colors text-xs font-bold px-1.5 py-0.5 rounded border border-white/20 hover:border-white/40">
                            1x
                        </button>
                        {/* Settings */}
                        <button className="text-white/60 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
                        {/* Fullscreen */}
                        <button className="text-white/60 hover:text-white transition-colors">
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}


