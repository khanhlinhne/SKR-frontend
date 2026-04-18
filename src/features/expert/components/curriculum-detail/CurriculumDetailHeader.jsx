import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Eye } from 'lucide-react';

export default function CurriculumDetailHeader({ courseName, chapterCount }) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Link to="/expert/curriculum" className="text-sm font-medium text-base-content/50 transition-colors hover:text-violet-600">
                        Chương trình học
                    </Link>
                    <ChevronRight className="h-3 w-3 text-base-content/30" />
                    <span className="max-w-[300px] truncate text-sm font-bold text-violet-600">
                        {courseName || 'Khóa học'}
                    </span>
                </div>
                <h1 className="text-2xl font-black text-base-content lg:text-3xl">
                    {chapterCount === 0 ? 'Tạo Chương trình học' : 'Quản lý Chương trình học'}
                </h1>
                <p className="mt-1 text-sm text-base-content/60">
                    {chapterCount === 0
                        ? 'Bắt đầu xây dựng nội dung khóa học bằng cách thêm các chương và bài giảng'
                        : 'Chỉnh sửa, thêm hoặc xóa chương và bài giảng'}
                </p>
            </div>
            <div className="flex gap-2">
                <Link to="/expert/curriculum" className="btn btn-sm btn-ghost rounded-xl gap-1.5 font-bold">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Link>
                <button className="btn btn-sm btn-ghost rounded-xl gap-1.5 font-bold">
                    <Eye className="h-4 w-4" />
                    Xem trước
                </button>
            </div>
        </div>
    );
}
