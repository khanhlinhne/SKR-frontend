import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
    Search,
    Layers3,
    Users,
    Frown,
    ArrowRight,
} from 'lucide-react';

import { HomeFooter, HomeNavBar } from '@/features/home/components';
import { flashcardApi } from '@/shared/api';
import { OwlLoader } from '@/shared/ui/common';

const PREVIEW_CARDS_LIMIT = 4;

function pickDeckColor(setTitle, index) {
    const colors = ['blue', 'green', 'purple', 'orange', 'yellow', 'red'];
    const hash = String(setTitle).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[(hash + index) % colors.length];
}

function pickDeckIcon(tags, title) {
    const source = `${title || ''} ${(tags || []).join(' ')}`.toLowerCase();
    if (source.includes('react') || source.includes('javascript') || source.includes('html') || source.includes('git')) return '💻';
    if (source.includes('sql') || source.includes('database')) return '🗄️';
    if (source.includes('vocabulary') || source.includes('từ vựng') || source.includes('english')) return '📘';
    if (source.includes('math') || source.includes('toán')) return '📐';
    if (source.includes('history') || source.includes('sử')) return '📜';
    if (source.includes('science') || source.includes('khoa học')) return '🔬';
    return '📚';
}

function normalizePublicSet(data, index) {
    const color = pickDeckColor(data.setTitle, index);
    const icon = pickDeckIcon(data.tags, data.setTitle);

    return {
        id: data.flashcardSetId,
        slug: data.flashcardSetId,
        title: data.setTitle || 'Bộ flashcard',
        description: data.setDescription || '',
        subject: data.tags && data.tags[0] || 'Công khai',
        tags: data.tags || [],
        totalCards: Number(data.totalCards || 0),
        previewCardsCount: PREVIEW_CARDS_LIMIT,
        isPublic: data.visibility === 'public',
        creatorName: data.creator?.displayName || data.creator?.fullName || 'Anonymous',
        creatorAvatar: data.creator?.avatarUrl || null,
        studyCount: data.timesStudied || 0,
        ratingAverage: data.averageRating || 0,
        ratingCount: 0,
        color,
        icon,
        createdAt: data.createdAt,
    };
}

function extractSetsFromResponse(response) {
    const payload = response?.data?.data || response?.data || response;
    const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
    return items;
}

function matchesSearchQuery(set, query) {
    if (!query) return true;

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return [
        set.title,
        set.description,
        set.subject,
        set.creatorName,
        ...(set.tags || []),
    ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

function applyClientFilters(items, { searchQuery, subjectFilter, sortBy }) {
    const filtered = items.filter((set) => {
        const matchesSubject = !subjectFilter || set.subject === subjectFilter;
        return matchesSubject && matchesSearchQuery(set, searchQuery);
    });

    filtered.sort((left, right) => {
        if (sortBy === 'popular') {
            return (right.studyCount || 0) - (left.studyCount || 0);
        }

        if (sortBy === 'cards') {
            return (right.totalCards || 0) - (left.totalCards || 0);
        }

        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

    return filtered;
}

function FlashcardSetCard({ set, index, searchQuery }) {
    const colorMap = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    };

    const badgeColorMap = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        green: 'bg-green-500/10 text-green-600 dark:text-green-400',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    };

    const highlightMatch = (text, query) => {
        if (!query || typeof text !== 'string') return text;
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-yellow-400/30 text-inherit rounded px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="group"
        >
            <Link
                to={`/flashcards/${set.slug}`}
                className={`block rounded-[28px] border bg-gradient-to-br ${colorMap[set.color] || colorMap.blue} p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{set.icon}</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColorMap[set.color] || badgeColorMap.blue}`}>
                                {set.subject}
                            </span>
                        </div>

                        <h3 className="apple-main-text text-lg font-semibold leading-tight">
                            {highlightMatch(set.title, searchQuery)}
                        </h3>

                        {set.description && (
                            <p className="apple-secondary-text mt-2 text-sm line-clamp-2">
                                {highlightMatch(set.description, searchQuery)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-base-content/60">
                        <span className="flex items-center gap-1.5">
                            <Layers3 className="h-4 w-4" />
                            {set.totalCards} thẻ
                        </span>
                        {set.studyCount > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {set.studyCount.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <span className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Xem chi tiết
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </div>

                {set.creatorName && (
                    <div className="mt-4 pt-4 border-t border-base-content/10 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                            {set.creatorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-base-content/70">{set.creatorName}</span>
                    </div>
                )}
            </Link>
        </motion.article>
    );
}

function SearchFilters({ searchQuery, setSearchQuery, sortBy, setSortBy, subjectFilter, setSubjectFilter, subjects }) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
                <input
                    type="text"
                    placeholder="Tìm kiếm bộ flashcard..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full pl-12 pr-4 h-12 rounded-full bg-base-200/50 border-base-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="select select-bordered h-12 rounded-full border-base-300 bg-base-200/50 min-w-[140px]"
            >
                <option value="">Tất cả môn</option>
                {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                        {subject}
                    </option>
                ))}
            </select>

            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered h-12 rounded-full border-base-300 bg-base-200/50 min-w-[160px]"
            >
                <option value="recent">Mới nhất</option>
                <option value="popular">Phổ biến nhất</option>
                <option value="cards">Nhiều thẻ nhất</option>
            </select>
        </div>
    );
}

export default function PublicFlashcards() {
    const [allSets, setAllSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const fetchPublicSets = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const params = {
                limit: 100,
                ...(searchQuery && { search: searchQuery }),
            };

            const response = await flashcardApi.searchPublic(params);
            const items = extractSetsFromResponse(response);
            const mapped = items.map((item, index) => normalizePublicSet(item, index));
            setAllSets(mapped);
            setHasSearched(true);
        } catch (err) {
            console.error('Failed to fetch public flashcards:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách flashcard');
            setAllSets([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchPublicSets();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [fetchPublicSets]);

    const subjects = useMemo(
        () => [...new Set(allSets.map((set) => set.subject).filter(Boolean))].sort((left, right) => left.localeCompare(right)),
        [allSets],
    );

    const sets = useMemo(
        () => applyClientFilters(allSets, { searchQuery, subjectFilter, sortBy }),
        [allSets, searchQuery, subjectFilter, sortBy],
    );

    return (
        <div className="apple-home apple-transition min-h-screen">
            <HomeNavBar />

            <main className="px-6 pt-24 pb-20 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="mb-8"
                    >
                        <h1 className="apple-main-text text-4xl font-semibold tracking-tight">
                            Khám phá Flashcard
                        </h1>
                        <p className="apple-secondary-text mt-3 text-lg">
                            Tìm kiếm bộ flashcard công khai từ cộng đồng. Xem trước và bắt đầu học ngay.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        className="mb-8"
                    >
                        <SearchFilters
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            subjectFilter={subjectFilter}
                            setSubjectFilter={setSubjectFilter}
                            subjects={subjects}
                        />
                    </motion.div>

                    {loading && (
                        <OwlLoader
                            message="Đang tải flashcard công khai..."
                            subMessage="Tìm kiếm trong cộng đồng người dùng."
                            className="py-16"
                        />
                    )}

                    {error && !loading && (
                        <div className="alert alert-error mb-6">
                            <Layers3 className="h-5 w-5" />
                            <span>{error}</span>
                            <button onClick={fetchPublicSets} className="btn btn-sm">
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!loading && !error && hasSearched && sets.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <Frown className="mx-auto h-16 w-16 text-base-content/30" />
                            <h3 className="mt-4 text-xl font-semibold">Không tìm thấy kết quả</h3>
                            <p className="mt-2 text-base-content/60">
                                Thử từ khóa khác hoặc bỏ bộ lọc để xem nhiều hơn.
                            </p>
                        </motion.div>
                    )}

                    {!loading && !error && sets.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {sets.map((set, index) => (
                                <FlashcardSetCard
                                    key={set.id}
                                    set={set}
                                    index={index}
                                    searchQuery={searchQuery}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}
