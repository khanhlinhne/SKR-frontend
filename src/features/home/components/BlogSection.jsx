import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, BookOpen, TrendingUp, Eye, Heart, Bookmark, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogSection() {
    const [hoveredCard, setHoveredCard] = useState(null);

    const posts = [
        {
            title: "5 Bí quyết ôn thi đại học cùng AI hiệu quả",
            excerpt: "Khám phá cách sử dụng chatbot AI để giải đáp thắc mắc và xây dựng lộ trình ôn thi cá nhân hóa cho riêng mình.",
            readTime: "8 phút",
            category: "Kinh nghiệm",
            author: {
                name: "Minh Anh",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhanh"
            },
            date: "25 Th1, 2026",
            views: "2.5K",
            likes: 156,
            gradient: "from-blue-500 to-cyan-500",
            lightGradient: "from-blue-500/10 to-cyan-500/10",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop",
            featured: true
        },
        {
            title: "Tại sao Spaced Repetition cứu rỗi bộ não?",
            excerpt: "Tìm hiểu thuật toán lặp lại ngắt quãng giúp ghi nhớ kiến thức hiệu quả và lâu dài hơn.",
            readTime: "12 phút",
            category: "Phương pháp",
            author: {
                name: "Hoàng Long",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hoanglong"
            },
            date: "22 Th1, 2026",
            views: "1.8K",
            likes: 98,
            gradient: "from-violet-500 to-purple-500",
            lightGradient: "from-violet-500/10 to-purple-500/10",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop"
        },
        {
            title: "Mind Map: Vũ khí bí mật cho kỳ thi trắc nghiệm",
            excerpt: "Cách hệ thống hóa kiến thức khổng lồ bằng sơ đồ tư duy kết hợp cùng công nghệ AI.",
            readTime: "6 phút",
            category: "Năng suất",
            author: {
                name: "Thu Hà",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thuha"
            },
            date: "20 Th1, 2026",
            views: "3.2K",
            likes: 234,
            gradient: "from-pink-500 to-rose-500",
            lightGradient: "from-pink-500/10 to-rose-500/10",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop"
        }
    ];

    const categories = [
        { name: "Tất cả", count: 42, active: true },
        { name: "Kinh nghiệm", count: 15 },
        { name: "Phương pháp", count: 12 },
        { name: "Năng suất", count: 8 },
        { name: "Công nghệ", count: 7 }
    ];

    return (
        <section className="py-28 bg-gradient-to-b from-base-100 via-base-200/30 to-base-100 relative overflow-hidden" id="blog">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/8 to-violet-500/8 rounded-full blur-[100px]"
                    animate={{
                        x: [0, 40, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/8 to-rose-500/8 rounded-full blur-[80px]"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* Subtle grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 mb-6"
                    >
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            Blog & Insights
                        </span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-base-content mb-6 tracking-tight">
                        Cẩm nang{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                học tập
                            </span>
                            <motion.div
                                className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-purple-500/30 rounded-full blur-sm"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            />
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium leading-relaxed">
                        Tổng hợp kiến thức, kỹ năng và xu hướng giáo dục thông minh giúp bạn tối ưu hóa việc học tập.
                    </p>
                </motion.div>

                {/* Category Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((cat, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${cat.active
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/25'
                                    : 'bg-base-200 text-base-content/60 hover:bg-base-300 hover:text-base-content'
                                }`}
                        >
                            {cat.name}
                            <span className={`ml-2 ${cat.active ? 'text-white/70' : 'text-base-content/40'}`}>
                                ({cat.count})
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Blog Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <BlogCard
                            key={index}
                            post={post}
                            index={index}
                            isHovered={hoveredCard === index}
                            onHover={() => setHoveredCard(index)}
                            onLeave={() => setHoveredCard(null)}
                        />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link to="/blog">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/25"
                        >
                            <Sparkles className="w-5 h-5" />
                            Khám phá thêm bài viết
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>

                    <div className="flex items-center gap-2 text-base-content/50">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">+42 bài viết mới tuần này</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function BlogCard({ post, index, isHovered, onHover, onLeave }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -10 }}
            onHoverStart={onHover}
            onHoverEnd={onLeave}
            className="group relative bg-base-100 rounded-[2rem] overflow-hidden border-2 border-base-200 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
        >
            {/* Featured badge */}
            {post.featured && (
                <motion.div
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                    className="absolute top-6 left-0 z-20 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-r-full shadow-lg flex items-center gap-1"
                >
                    <TrendingUp className="w-3 h-3" />
                    Nổi bật
                </motion.div>
            )}

            {/* Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <motion.img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    animate={{
                        scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Category badge */}
                <motion.div
                    className={`absolute top-4 right-4 px-4 py-1.5 bg-gradient-to-r ${post.gradient} text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg`}
                    whileHover={{ scale: 1.05 }}
                >
                    {post.category}
                </motion.div>

                {/* Quick actions on hover */}
                <motion.div
                    className="absolute bottom-4 right-4 flex gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                    transition={{ duration: 0.3 }}
                >
                    <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-base-content hover:bg-white hover:scale-110 transition-all shadow-lg">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-base-content hover:bg-white hover:scale-110 transition-all shadow-lg">
                        <Bookmark className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
                {/* Author & Date */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full border-2 border-base-200"
                    />
                    <div>
                        <p className="font-semibold text-base-content text-sm">{post.author.name}</p>
                        <p className="text-xs text-base-content/50">{post.date}</p>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-base-content mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-base-content/60 mb-6 line-clamp-2 font-medium text-sm leading-relaxed">
                    {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-base-200">
                    <div className="flex items-center gap-4 text-xs text-base-content/50 font-semibold">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            {post.views}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                        </span>
                    </div>

                    <motion.div
                        className="flex items-center gap-1 text-blue-600 font-bold text-sm"
                        whileHover={{ x: 5 }}
                    >
                        Đọc thêm
                        <ChevronRight className="w-4 h-4" />
                    </motion.div>
                </div>
            </div>

            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${post.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
        </motion.article>
    );
}
