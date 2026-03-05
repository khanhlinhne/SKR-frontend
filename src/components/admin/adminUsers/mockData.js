/**
 * Mock data cho trang quản lý người dùng.
 * Sẽ được thay thế bằng API thực tế sau này.
 */
export const mockUsers = [
    {
        id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', role: 'Learner',
        status: 'active', courses: 5, joinDate: '15/01/2026', lastActive: '10 phút trước',
        avatar: 'https://i.pravatar.cc/150?img=1', phone: '0912 345 678',
        address: 'Quận 1, TP. Hồ Chí Minh',
        bio: 'Sinh viên năm 3, đam mê học toán và lập trình.',
        totalSpent: '₫1,495,000', completedCourses: 3, certificates: 2,
        enrolledCourses: [
            { name: 'Toán Cao Cấp Pro', progress: 85, status: 'active' },
            { name: 'Lập Trình Python', progress: 60, status: 'active' },
            { name: 'IELTS Speaking Pack', progress: 100, status: 'completed' },
            { name: 'Vật Lý Đại Cương', progress: 100, status: 'completed' },
            { name: 'Data Science Bundle', progress: 30, status: 'active' },
        ],
        activityLog: [
            { action: 'Hoàn thành bài học "Đạo hàm riêng"', time: '10 phút trước', type: 'lesson' },
            { action: 'Nộp bài tập Chapter 5', time: '1 giờ trước', type: 'assignment' },
            { action: 'Nhận chứng chỉ "IELTS Speaking"', time: '2 ngày trước', type: 'certificate' },
            { action: 'Đăng ký khóa "Data Science Bundle"', time: '1 tuần trước', type: 'enroll' },
        ]
    },
    {
        id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', role: 'Expert',
        status: 'active', courses: 12, joinDate: '20/01/2026', lastActive: '1 giờ trước',
        avatar: 'https://i.pravatar.cc/150?img=5', phone: '0908 765 432',
        address: 'Quận 7, TP. Hồ Chí Minh',
        bio: 'Giáo viên tiếng Anh, đang học thêm về công nghệ.',
        totalSpent: '₫5,890,000', completedCourses: 8, certificates: 6,
        enrolledCourses: [
            { name: 'Data Science Bundle', progress: 75, status: 'active' },
            { name: 'Lập Trình Python', progress: 100, status: 'completed' },
        ],
        activityLog: [
            { action: 'Hoàn thành quiz "Machine Learning"', time: '1 giờ trước', type: 'assignment' },
            { action: 'Xem video bài giảng Chapter 8', time: '3 giờ trước', type: 'lesson' },
        ]
    },
    {
        id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', role: 'Learner',
        status: 'pending', courses: 2, joinDate: '01/02/2026', lastActive: '2 ngày trước',
        avatar: 'https://i.pravatar.cc/150?img=8', phone: '0987 123 456',
        address: 'Quận Cầu Giấy, Hà Nội',
        bio: 'Lập trình viên mới bắt đầu.',
        totalSpent: '₫498,000', completedCourses: 0, certificates: 0,
        enrolledCourses: [
            { name: 'Lập Trình Python', progress: 20, status: 'active' },
            { name: 'Toán Cao Cấp Pro', progress: 5, status: 'active' },
        ],
        activityLog: [
            { action: 'Bắt đầu khóa "Toán Cao Cấp Pro"', time: '2 ngày trước', type: 'enroll' },
        ]
    },
    {
        id: 4, name: 'Phạm Minh Duy', email: 'duy.pham@email.com', role: 'Staff',
        status: 'active', courses: 8, joinDate: '10/02/2026', lastActive: '30 phút trước',
        avatar: 'https://i.pravatar.cc/150?img=11', phone: '0901 234 567',
        address: 'Quận 3, TP. Hồ Chí Minh',
        bio: 'Kỹ sư phần mềm, thích học hỏi công nghệ mới.',
        totalSpent: '₫3,200,000', completedCourses: 5, certificates: 4,
        enrolledCourses: [
            { name: 'Data Science Bundle', progress: 90, status: 'active' },
        ],
        activityLog: [
            { action: 'Hoàn thành project cuối khóa', time: '30 phút trước', type: 'assignment' },
        ]
    },
    {
        id: 5, name: 'Hoàng Thị Nga', email: 'nga.hoang@email.com', role: 'Learner',
        status: 'banned', courses: 1, joinDate: '25/02/2026', lastActive: '1 tuần trước',
        avatar: 'https://i.pravatar.cc/150?img=9', phone: '0976 543 210',
        address: 'Quận Hai Bà Trưng, Hà Nội',
        bio: '',
        totalSpent: '₫199,000', completedCourses: 0, certificates: 0,
        enrolledCourses: [
            { name: 'Tiếng Anh Cơ Bản', progress: 10, status: 'paused' },
        ],
        activityLog: [
            { action: 'Tài khoản bị khóa do vi phạm', time: '1 tuần trước', type: 'system' },
        ]
    },
    {
        id: 6, name: 'Võ Đình Khoa', email: 'khoa.vo@email.com', role: 'Learner',
        status: 'active', courses: 3, joinDate: '28/02/2026', lastActive: '3 giờ trước',
        avatar: 'https://i.pravatar.cc/150?img=14', phone: '0934 567 890',
        address: 'TP. Đà Nẵng',
        bio: 'Sinh viên CNTT năm cuối.',
        totalSpent: '₫897,000', completedCourses: 1, certificates: 1,
        enrolledCourses: [
            { name: 'Lập Trình Python', progress: 100, status: 'completed' },
            { name: 'Data Science Bundle', progress: 45, status: 'active' },
            { name: 'Hóa Học Hữu Cơ', progress: 15, status: 'active' },
        ],
        activityLog: [
            { action: 'Hoàn thành khóa "Lập Trình Python"', time: '3 giờ trước', type: 'certificate' },
        ]
    },
    {
        id: 7, name: 'Bùi Thị Lan', email: 'lan.bui@email.com', role: 'Expert',
        status: 'active', courses: 15, joinDate: '01/03/2026', lastActive: '5 phút trước',
        avatar: 'https://i.pravatar.cc/150?img=20', phone: '0915 678 901',
        address: 'Quận 10, TP. Hồ Chí Minh',
        bio: 'Top learner tháng 2/2026.',
        totalSpent: '₫8,750,000', completedCourses: 12, certificates: 10,
        enrolledCourses: [
            { name: 'Toán Cao Cấp Pro', progress: 95, status: 'active' },
        ],
        activityLog: [
            { action: 'Đạt top 1 bảng xếp hạng tuần', time: '5 phút trước', type: 'achievement' },
        ]
    },
    {
        id: 8, name: 'Đặng Văn Minh', email: 'minh.dang@email.com', role: 'Learner',
        status: 'pending', courses: 0, joinDate: '02/03/2026', lastActive: '1 ngày trước',
        avatar: 'https://i.pravatar.cc/150?img=52', phone: '0943 210 987',
        address: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
        bio: 'Vừa đăng ký tài khoản.',
        totalSpent: '₫0', completedCourses: 0, certificates: 0,
        enrolledCourses: [],
        activityLog: [
            { action: 'Đăng ký tài khoản mới', time: '1 ngày trước', type: 'system' },
        ]
    },
];
