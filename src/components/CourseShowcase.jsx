import React from 'react';
import { Star, Users, ArrowRight } from 'lucide-react';

const courses = [
    {
        title: "TOEIC 750+ Chinh phục",
        students: "12.5k",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Ngoại ngữ",
        color: "badge-primary"
    },
    {
        title: "IELTS Speaking Pro",
        students: "8.2k",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Viết",
        color: "badge-secondary"
    },
    {
        title: "Toán cao cấp A1-A2",
        students: "5.1k",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Đại học",
        color: "badge-accent"
    },
    {
        title: "Hóa hữu cơ chuyên sâu",
        students: "3.4k",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Khoa học",
        color: "badge-info"
    }
];

export default function CourseShowcase() {
    return (
        <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-bold font-['Lexend'] text-slate-900 mb-2">
                            Môn học nổi bật
                        </h2>
                        <p className="text-slate-500">Khám phá các lộ trình học tập phổ biến nhất</p>
                    </div>
                    <a href="#" className="hidden md:flex items-center text-blue-600 font-semibold hover:gap-2 transition-all">
                        Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses.map((course, idx) => (
                        <div key={idx} className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 group cursor-pointer h-full">
                            <figure className="relative h-48 overflow-hidden">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className={`badge ${course.color} absolute top-4 left-4 text-white uppercase font-bold text-xs tracking-wider shadow-md`}>
                                    {course.category}
                                </div>
                            </figure>
                            <div className="card-body p-6">
                                <h3 className="card-title text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{course.students}<span> lượt học</span></span>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500 font-medium">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span>{course.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center md:hidden">
                    <button className="btn btn-outline btn-primary">Xem tất cả</button>
                </div>
            </div>
        </div>
    );
}
