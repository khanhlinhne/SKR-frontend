import React from 'react';
import { Search, LogIn, Menu, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NavBar() {
    return (
        <div className="navbar fixed top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <Menu className="h-5 w-5" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li><a>Khóa học</a></li>
                        <li><a>Tính năng</a></li>
                        <li><a>Bảng giá</a></li>
                    </ul>
                </div>
                {/* Logo với hiệu ứng Gradient chuẩn UI */}
                <Link to="/" className="btn btn-ghost text-2xl font-bold gap-2">
                    <Brain className="w-8 h-8 text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-['Lexend']">
                        SKR
                    </span>
                </Link>
            </div>


            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 font-medium text-slate-600">
                    <li><a className="hover:text-blue-600 transition-colors">Khóa học</a></li>
                    <li><a className="hover:text-blue-600 transition-colors">Tính năng</a></li>
                    <li><a className="hover:text-blue-600 transition-colors">Bảng giá</a></li>
                </ul>
            </div>

            <div className="navbar-end gap-2">
                {/* Thanh tìm kiếm */}
                <div className="hidden sm:flex relative">
                    <input
                        type="text"
                        placeholder="Tìm khóa học..."
                        className="input input-sm input-bordered w-full max-w-xs pl-9 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 transition-all"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Nút hành động */}
                <Link to="/login" className="btn btn-sm btn-ghost text-slate-600 font-medium">Đăng nhập</Link>
                <Link to="/signup" className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full px-6 shadow-lg shadow-blue-600/20 transition-all duration-300">
                    Bắt đầu ngay
                </Link>
            </div>
        </div>
    );
}
