import { HelpCircle } from 'lucide-react';
import { LearnQuizResultsView, LearnQuizReviewView, LearnQuizTakingView } from '@/features/learn/components';
import useLearnQuizTaking from '@/features/learn/hooks/useLearnQuizTaking';
import { OwlLoader } from '@/shared/ui/common';

export default function LearnQuizTaking() {
    const {
        lesson,
        loading,
        error,
        phase,
        result,
        questions,
        gradient,
        handleSubmit,
        handleRetry,
        showReview,
        backToResults,
    } = useLearnQuizTaking();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-200">
                <OwlLoader
                    message="Đang tải bài quiz..."
                    subMessage="Cú đang chuẩn bị câu hỏi và đáp án cho bạn."
                    className="py-8"
                />
            </div>
        );
    }

    if (error || !lesson || questions.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-200">
                <div className="text-center">
                    <HelpCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
                    <h2 className="mb-2 text-xl font-black text-base-content">
                        {error || 'Quiz không có câu hỏi'}
                    </h2>
                    <p className="mb-4 text-sm text-base-content/50">
                        Vui lòng quay lại trang học và thử lại.
                    </p>
                    <button onClick={() => window.close()} className="btn rounded-xl font-bold">
                        Đóng tab
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'review' && result) {
        return (
            <LearnQuizReviewView
                lesson={lesson}
                result={result}
                onBackToResults={backToResults}
                onRetry={handleRetry}
            />
        );
    }

    if (phase === 'results' && result) {
        return (
            <LearnQuizResultsView
                lesson={lesson}
                gradient={gradient}
                result={result}
                onRetry={handleRetry}
                onShowReview={showReview}
            />
        );
    }

    return (
        <LearnQuizTakingView
            lesson={lesson}
            gradient={gradient}
            questions={questions}
            onSubmit={handleSubmit}
        />
    );
}
