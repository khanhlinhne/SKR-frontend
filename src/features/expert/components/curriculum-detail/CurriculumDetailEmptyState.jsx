import { FolderPlus, GraduationCap } from 'lucide-react';

export default function CurriculumDetailEmptyState({ onAddChapter }) {
    return (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-violet-500/30 bg-base-100 p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                <GraduationCap className="h-10 w-10 text-violet-500/50" />
            </div>
            <h3 className="mb-2 text-lg font-black text-base-content">Khóa học chưa có nội dung</h3>
            <p className="mx-auto mb-5 max-w-md text-sm text-base-content/50">
                Bắt đầu xây dựng chương trình học bằng cách thêm chương đầu tiên. Mỗi chương sẽ chứa các bài giảng như video, tài liệu hoặc flashcard.
            </p>
            <button
                onClick={onAddChapter}
                className="btn border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 gap-2 rounded-xl font-black text-white shadow-lg shadow-violet-500/25"
            >
                <FolderPlus className="h-5 w-5" />
                Thêm chương đầu tiên
            </button>
        </div>
    );
}
