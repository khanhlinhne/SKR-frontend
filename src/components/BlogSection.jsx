import * as motion from 'motion/react-client';
import { ArrowRight, Clock } from 'lucide-react';

export default function BlogSection() {
    const posts = [
        {
            title: "5 Bí quyết ôn thi đại học cùng AI hiệu quả",
            excerpt: "Khám phá cách sử dụng chatbot AI để giải đáp thắc mắc và lộ trình ôn thi cá nhân hóa.",
            readTime: "8 phút đọc",
            category: "Kinh nghiệm",
            gradient: "from-blue-500 to-cyan-500",
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop"
        },
        {
            title: "Tại sao Spaced Repetition cứu rỗi bộ não của bạn?",
            excerpt: "Tìm hiểu thuật toán lặp lại ngắt quãng giúp ghi nhớ kiến thức vĩnh viễn.",
            readTime: "12 phút đọc",
            category: "Phương pháp",
            gradient: "from-violet-500 to-purple-500",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop"
        },
        {
            title: "Ưu điểm của Mind Map trong ôn thi trắc nghiệm",
            excerpt: "Cách hệ thống hóa kiến thức khổng lồ bằng sơ đồ tư duy kết hợp cùng SKR.",
            readTime: "6 phút đọc",
            category: "Năng suất",
            gradient: "from-pink-500 to-rose-500",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section className="py-24 bg-base-200/50 relative overflow-hidden" id="blog">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-base-content mb-4 tracking-tight">
                        Cẩm nang{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent italic">
                            học tập
                        </span>
                    </h2>
                    <p className="text-xl text-base-content/60 max-w-2xl mx-auto font-medium">
                        Tổng hợp các kỹ năng, phương pháp và xu hướng giáo dục thông minh.
                    </p>
                </motion.div>

                {/* Blog Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {posts.map((post, index) => (
                        <BlogCard key={index} post={post} itemVariants={itemVariants} />
                    ))}
                </motion.div>

                {/* View all link */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-2 group text-lg transition-colors">
                        Xem tất cả bài viết
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

function BlogCard({ post, itemVariants }) {
    return (
        <motion.article
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="group relative bg-base-100 rounded-[2rem] overflow-hidden border border-base-300 hover:border-blue-500/20 transition-all duration-500 hover:shadow-2xl cursor-pointer"
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-base-200">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Category badge */}
                <div className={`absolute top-4 left-4 px-4 py-1.5 bg-gradient-to-r ${post.gradient} text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg`}>
                    {post.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <h3 className="text-xl font-black text-base-content mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                </h3>
                <p className="text-base-content/60 mb-6 line-clamp-2 font-medium">
                    {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-2 text-sm text-base-content/40 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                </div>
            </div>

            {/* Hover gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
        </motion.article>
    );
}
