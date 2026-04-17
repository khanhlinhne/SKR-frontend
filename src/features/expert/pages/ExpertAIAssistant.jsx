import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    Sparkles,
    FileText,
    Video,
    HelpCircle,
    Send,
    Copy,
    Check,
    RefreshCw,
    Wand2,
    BookOpen,
    ListChecks,
    MessageSquare,
    Lightbulb,
    ChevronRight,
    Loader2,
    ThumbsUp,
    ThumbsDown,
    X,
    Plus,
    Zap,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== AI TOOLS CONFIG =====
const aiTools = [
    {
        id: 'outline',
        title: 'Tạo Đề cương',
        description: 'Tự động tạo bản thảo đề cương khóa học từ chủ đề',
        icon: BookOpen,
        gradient: 'from-violet-500 to-purple-600',
        placeholder: 'Nhập tên khóa học hoặc chủ đề, ví dụ: "React Hooks cho người mới bắt đầu"',
    },
    {
        id: 'summarize',
        title: 'Tóm tắt Video',
        description: 'Chuyển nội dung video thành văn bản tóm tắt',
        icon: Video,
        gradient: 'from-blue-500 to-cyan-600',
        placeholder: 'Dán URL video hoặc nhập transcript cần tóm tắt...',
    },
    {
        id: 'quiz',
        title: 'Tạo Câu hỏi Quiz',
        description: 'Đề xuất bộ câu hỏi trắc nghiệm dựa trên nội dung',
        icon: HelpCircle,
        gradient: 'from-amber-500 to-orange-600',
        placeholder: 'Dán nội dung bài giảng để AI tạo câu hỏi trắc nghiệm...',
    },
    {
        id: 'improve',
        title: 'Cải thiện Nội dung',
        description: 'Gợi ý cải thiện, bổ sung nội dung bài giảng',
        icon: Lightbulb,
        gradient: 'from-emerald-500 to-teal-600',
        placeholder: 'Dán nội dung bài giảng cần cải thiện...',
    },
];

// ===== MOCK AI RESPONSES =====
const mockResponses = {
    outline: {
        title: 'Đề cương: React Hooks cho người mới',
        content: `## 📚 Đề cương Khóa học: React Hooks

### Chương 1: Giới thiệu React Hooks
- Hooks là gì? Tại sao cần Hooks?
- Quy tắc sử dụng Hooks
- So sánh Class Components vs Functional Components

### Chương 2: useState - Quản lý State
- Khởi tạo state với useState
- Cập nhật state đúng cách
- State với objects và arrays
- Bài tập thực hành: Todo App

### Chương 3: useEffect - Side Effects
- Lifecycle trong Functional Components
- Dependency array và cách hoạt động
- Cleanup function
- Các pattern phổ biến

### Chương 4: Hooks nâng cao
- useContext - Chia sẻ dữ liệu
- useRef - Truy cập DOM
- useMemo & useCallback - Tối ưu hiệu suất
- Custom Hooks

### Chương 5: Dự án cuối khóa
- Xây dựng E-commerce Mini App
- Áp dụng tất cả Hooks đã học`,
    },
    quiz: {
        title: '10 Câu hỏi trắc nghiệm được đề xuất',
        content: `### Câu 1: useState trả về gì?
- A) Một object chứa state
- B) Một array gồm [value, setter] ✅
- C) Một function
- D) Một string

### Câu 2: Khi nào useEffect chạy với dependency array rỗng []?
- A) Mỗi lần render
- B) Chỉ khi mount lần đầu ✅
- C) Khi unmount
- D) Không bao giờ chạy

### Câu 3: useMemo dùng để làm gì?
- A) Lưu trữ ref
- B) Memo hóa giá trị tính toán ✅
- C) Tạo context
- D) Quản lý state

### Câu 4: Custom Hook phải bắt đầu bằng?
- A) hook
- B) custom
- C) use ✅
- D) my

### Câu 5: useCallback khác useMemo ở điểm nào?
- A) Không khác gì
- B) useCallback memo hóa function ✅
- C) useMemo nhanh hơn
- D) useCallback không cần dependencies`,
    },
};

// ===== MAIN COMPONENT =====
export default function ExpertAIAssistant() {
    const [selectedTool, setSelectedTool] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        if (!inputText.trim() || !selectedTool) return;
        setIsGenerating(true);
        setAiResult(null);

        // Simulate AI generation
        setTimeout(() => {
            const response = mockResponses[selectedTool.id] || mockResponses.outline;
            setAiResult(response);
            setIsGenerating(false);
        }, 2000);
    };

    const handleCopy = () => {
        if (aiResult) {
            navigator.clipboard.writeText(aiResult.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegenerate = () => {
        handleGenerate();
    };

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-fuchsia-500" />
                            Trợ lý AI
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Sử dụng AI để tạo nội dung khóa học nhanh chóng và hiệu quả
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="badge badge-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-none font-bold gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            AI Powered
                        </div>
                    </div>
                </motion.div>

                {/* Tool Selection Grid */}
                <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {aiTools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const isSelected = selectedTool?.id === tool.id;
                        return (
                            <motion.button
                                key={tool.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSelectedTool(tool);
                                    setAiResult(null);
                                }}
                                className={`p-5 rounded-2xl text-left transition-all border-2 ${isSelected
                                    ? 'border-violet-500 bg-violet-500/5 shadow-lg shadow-violet-500/10'
                                    : 'border-base-300 bg-base-100 hover:border-violet-500/30 hover:shadow-md'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg mb-3`}>
                                    <ToolIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-black text-base-content text-sm mb-1">{tool.title}</h3>
                                <p className="text-xs text-base-content/60 leading-relaxed">{tool.description}</p>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mt-2"
                                    >
                                        <span className="text-[10px] font-bold text-violet-600 bg-violet-500/10 px-2 py-0.5 rounded-full">
                                            Đang chọn ✓
                                        </span>
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Input Area */}
                <AnimatePresence>
                    {selectedTool && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-base-100 rounded-2xl border border-base-300 shadow-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <selectedTool.icon className="w-5 h-5 text-violet-500" />
                                    <h3 className="font-black text-base-content">{selectedTool.title}</h3>
                                </div>
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={selectedTool.placeholder}
                                    rows={5}
                                    className="textarea textarea-bordered w-full rounded-xl text-sm resize-none focus:border-violet-500 bg-base-200/50"
                                />
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-base-content/50">
                                        {inputText.length} ký tự
                                    </p>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!inputText.trim() || isGenerating}
                                        className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold shadow-lg shadow-violet-500/25 gap-2 disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-4 h-4" />
                                                Tạo với AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-base-100 rounded-2xl border border-base-300 shadow-lg p-8 mb-6"
                        >
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-ping opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-base-content">AI đang xử lý...</p>
                                    <p className="text-sm text-base-content/60">Đợi một chút, nội dung sẽ sẵn sàng ngay</p>
                                </div>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                            className="w-2 h-2 rounded-full bg-violet-500"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Result */}
                <AnimatePresence>
                    {aiResult && !isGenerating && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-base-100 rounded-2xl border border-base-300 shadow-lg overflow-hidden"
                        >
                            {/* Result Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-fuchsia-500" />
                                    <h3 className="font-black text-base-content">{aiResult.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleRegenerate}
                                        className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Tạo lại
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="btn btn-sm btn-ghost rounded-xl font-bold gap-1.5"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Đã sao chép' : 'Sao chép'}
                                    </button>
                                </div>
                            </div>

                            {/* Result Content */}
                            <div className="px-6 py-5">
                                <div className="prose prose-sm max-w-none text-base-content/90 whitespace-pre-wrap leading-relaxed">
                                    {aiResult.content}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="px-6 py-4 border-t border-base-300 bg-base-200/30 flex items-center justify-between">
                                <p className="text-xs text-base-content/50">Kết quả này có hữu ích không?</p>
                                <div className="flex items-center gap-2">
                                    <button className="btn btn-sm btn-ghost rounded-xl gap-1 text-emerald-600 hover:bg-emerald-500/10">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        Hữu ích
                                    </button>
                                    <button className="btn btn-sm btn-ghost rounded-xl gap-1 text-red-500 hover:bg-red-500/10">
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                        Chưa tốt
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </ExpertLayout>
    );
}
