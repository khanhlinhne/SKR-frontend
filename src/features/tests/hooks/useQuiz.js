import { useState, useEffect, useCallback, useRef } from 'react';
import quizApi from '@/shared/api/quizApi';

// ─── useQuizPractices ────────────────────────────────────
// Load danh sách bài thi thử cho trang Tests.jsx
export function useQuizPractices() {
    const [practices, setPractices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPractices = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await quizApi.getPractices({ limit: 100, status: 'active' });
            const items = Array.isArray(res.data?.items) ? res.data.items : [];
            setPractices(items.filter((item) => item?.status !== 'deleted'));
        } catch (err) {
            console.error('Error fetching quiz practices:', err);
            setError('Không thể tải danh sách bài thi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPractices(); }, [fetchPractices]);

    return { practices, loading, error, refresh: fetchPractices };
}

// ─── useQuizDetail ───────────────────────────────────────
// Load chi tiết 1 bài thi thử + lịch sử attempts
export function useQuizDetail(practiceTestId) {
    const [practice, setPractice] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!practiceTestId) return;

        let cancelled = false;
        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                const [practiceRes, attemptsRes] = await Promise.all([
                    quizApi.getPracticeById(practiceTestId),
                    quizApi.getMyAttempts({ practiceTestId, limit: 20 }),
                ]);

                if (cancelled) return;
                setPractice(practiceRes.data);
                setAttempts(attemptsRes.data?.items || []);
            } catch (err) {
                if (cancelled) return;
                console.error('Error fetching quiz detail:', err);
                setError('Không thể tải thông tin bài thi.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchDetail();
        return () => { cancelled = true; };
    }, [practiceTestId]);

    // Bắt đầu lượt thi mới
    const startAttempt = useCallback(async (passingScore) => {
        const res = await quizApi.startAttempt(practiceTestId, { passingScore });
        return res.data; // { attempt: { attemptId, questions, ... } }
    }, [practiceTestId]);

    return { practice, attempts, loading, error, startAttempt };
}

// ─── useQuizTaking ───────────────────────────────────────
// Quản lý state khi đang làm bài: câu hỏi, timer, answers
export function useQuizTaking(attemptId) {
    const [attemptData, setAttemptData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!attemptId) return;

        let cancelled = false;
        const fetchAttempt = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await quizApi.getAttempt(attemptId);
                if (!cancelled) setAttemptData(res.data);
            } catch (err) {
                if (!cancelled) {
                    console.error('Error fetching quiz attempt:', err);
                    setError('Không thể tải bài thi.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAttempt();
        return () => { cancelled = true; };
    }, [attemptId]);

    // Submit bài thi
    const submitAttempt = useCallback(async (answers) => {
        try {
            setSubmitting(true);
            const res = await quizApi.submitAttempt(attemptId, { answers });
            return res.data; // quiz result
        } catch (err) {
            console.error('Error submitting quiz:', err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [attemptId]);

    // Derived data
    const questions = attemptData?.questions || [];
    const testInfo = attemptData ? {
        attemptId: attemptData.attemptId,
        quizTitle: attemptData.quizTitle,
        totalQuestions: attemptData.totalQuestions,
        timeLimitSeconds: attemptData.timeLimitSeconds,
        status: attemptData.status,
        startedAtUtc: attemptData.startedAtUtc,
    } : null;

    return { testInfo, questions, loading, error, submitting, submitAttempt };
}

// ─── useQuizResult ───────────────────────────────────────
// Load kết quả tổng quan của 1 lượt thi
export function useQuizResult(attemptId) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!attemptId) return;

        let cancelled = false;
        const fetchResult = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await quizApi.getAttemptResult(attemptId);
                if (!cancelled) setResult(res.data);
            } catch (err) {
                if (!cancelled) {
                    console.error('Error fetching quiz result:', err);
                    setError('Không thể tải kết quả.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchResult();
        return () => { cancelled = true; };
    }, [attemptId]);

    return { result, loading, error };
}

// ─── useQuizReview ───────────────────────────────────────
// Load chi tiết đáp án (review) sau khi nộp bài
export function useQuizReview(attemptId) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!attemptId) return;

        let cancelled = false;
        const fetchReview = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await quizApi.reviewAttempt(attemptId);
                if (!cancelled) setReview(res.data);
            } catch (err) {
                if (!cancelled) {
                    console.error('Error fetching quiz review:', err);
                    setError('Không thể tải chi tiết bài làm.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchReview();
        return () => { cancelled = true; };
    }, [attemptId]);

    return { review, loading, error };
}
