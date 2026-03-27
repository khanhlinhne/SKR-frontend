import { useState, useRef } from 'react';
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
    Loader2,
} from 'lucide-react';

/**
 * parseVideoUrl — Trích xuất embed URL cho YouTube, hoặc trả về URL gốc cho video trực tiếp.
 */
function parseVideoUrl(url) {
    if (!url) return null;

    // YouTube standard
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
    }

    // YouTube embed
    const ytEmbedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (ytEmbedMatch) {
        return { type: 'youtube', embedUrl: url.includes('autoplay') ? url : `${url}?autoplay=1&rel=0` };
    }

    // Direct video file
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
        return { type: 'direct', url: fullUrl };
    }

    // Default: try as direct
    return { type: 'unknown', url };
}

/**
 * LearnVideoPlayer - Video player with real video support.
 * Supports YouTube embeds and direct MP4 files.
 */
export default function LearnVideoPlayer({
    lesson,
    gradient = 'from-blue-500 to-violet-500',
    isPlaying = false,
    onTogglePlay,
    loadingContent = false,
}) {
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef(null);

    // Get the first video from lesson content
    const firstVideo = lesson?.videos?.[0] || null;
    const videoInfo = firstVideo ? parseVideoUrl(firstVideo.videoUrl) : null;
    const hasRealVideo = !!videoInfo;

    const duration = firstVideo?.videoDurationSeconds
        || (lesson?.durationMinutes || 25) * 60;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Loading state
    if (loadingContent) {
        return (
            <div className="relative aspect-video bg-gray-950 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
                <div className="text-center z-10">
                    <Loader2 className="w-10 h-10 text-white/50 mx-auto mb-3 animate-spin" />
                    <p className="text-white/40 text-sm font-medium">Đang tải nội dung...</p>
                </div>
            </div>
        );
    }

    // YouTube embed
    if (hasRealVideo && videoInfo.type === 'youtube') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-video bg-gray-950 rounded-2xl overflow-hidden shadow-2xl"
            >
                <iframe
                    src={videoInfo.embedUrl}
                    title={firstVideo.videoTitle || lesson?.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </motion.div>
        );
    }

    // Direct video (mp4, webm, etc.)
    if (hasRealVideo && videoInfo.type === 'direct') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-video bg-gray-950 rounded-2xl overflow-hidden shadow-2xl"
            >
                <video
                    ref={videoRef}
                    src={videoInfo.url}
                    className="absolute inset-0 w-full h-full object-contain"
                    controls
                    controlsList="nodownload"
                    poster={firstVideo.videoThumbnailUrl || undefined}
                >
                    Trình duyệt của bạn không hỗ trợ phát video.
                </video>
            </motion.div>
        );
    }

    // Fallback: No video — show placeholder with gradient
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
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }}
                />

                {/* No video message */}
                <div className="z-10 text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-30 flex items-center justify-center mx-auto mb-3`}>
                        <Play className="w-7 h-7 text-white ml-0.5" fill="white" />
                    </div>
                    <p className="text-white/30 text-sm font-medium mb-1">
                        {lesson?.videos?.length === 0 ? 'Chưa có video cho bài học này' : lesson?.title}
                    </p>
                    {lesson?.documents?.length > 0 && (
                        <p className="text-white/20 text-xs">Xem tài liệu bên dưới ↓</p>
                    )}
                </div>
            </div>

            {/* Bottom controls overlay (for placeholder) */}
            <motion.div
                initial={false}
                animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-5"
            >
                <div className="mb-3">
                    <div className="relative h-1 rounded-full bg-white/20 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-white/10 rounded-full w-0" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onTogglePlay} className="text-white/90 hover:text-white transition-colors">
                            <Play className="w-5 h-5" fill="white" />
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <SkipBack className="w-4 h-4" />
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <SkipForward className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <span className="text-white/60 text-xs font-medium ml-1">
                            0:00 / {formatTime(duration)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="text-white/60 hover:text-white transition-colors text-xs font-bold px-1.5 py-0.5 rounded border border-white/20 hover:border-white/40">
                            1x
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
                        <button className="text-white/60 hover:text-white transition-colors">
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
