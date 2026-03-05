import * as motion from 'motion/react-client';
import { Star, MessageSquare } from 'lucide-react';
import { cardVariants } from './constants';

/**
 * CourseReviewsList — Đánh giá gần đây của học viên
 */
export default function CourseReviewsList({ reviews = [], rating = 0, ratingCount = 0 }) {
    const renderStars = (count) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < count
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-base-content/20'
                    }`}
            />
        ));
    };

    return (
        <motion.div
            variants={cardVariants}
            className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    Đánh giá gần đây
                </h3>
                {rating > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">{renderStars(Math.round(rating))}</div>
                        <span className="text-sm font-bold text-base-content">{rating}</span>
                        <span className="text-xs text-base-content/40">({ratingCount})</span>
                    </div>
                )}
            </div>

            {/* Reviews */}
            <div className="divide-y divide-base-200">
                {reviews.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <MessageSquare className="w-10 h-10 text-base-content/20 mx-auto mb-2" />
                        <p className="text-sm text-base-content/40 font-medium">Chưa có đánh giá nào</p>
                    </div>
                ) : (
                    reviews.map((review, i) => (
                        <div key={review.userId || i} className="px-6 py-4 hover:bg-base-200/30 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="avatar flex-shrink-0">
                                    <div className="w-9 h-9 rounded-full">
                                        <img
                                            src={review.avatar || 'https://i.pravatar.cc/40'}
                                            alt={review.userName}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-sm font-bold text-base-content truncate">
                                            {review.userName}
                                        </h4>
                                        <span className="text-xs text-base-content/40 flex-shrink-0">{review.date}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mt-0.5">
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-sm text-base-content/70 mt-1.5 line-clamp-2">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
