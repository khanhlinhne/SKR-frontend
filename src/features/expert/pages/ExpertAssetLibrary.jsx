import { useState } from 'react';
import { motion } from 'motion/react';
import { ExpertLayout } from '@/features/expert/components';
import {
    FolderOpen,
    Video,
    FileText,
    Image,
    Upload,
    Search,
    Grid3X3,
    List,
    Filter,
    MoreHorizontal,
    Download,
    Trash2,
    Copy,
    Eye,
    Clock,
    HardDrive,
    File,
    Film,
    FileImage,
    Plus,
    SortAsc,
    Check,
    X,
} from 'lucide-react';

// ===== ANIMATION =====
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ===== ASSET TYPES =====
const assetTypeConfig = {
    video: { label: 'Video', icon: Film, color: 'text-blue-500 bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' },
    document: { label: 'Tài liệu', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10', gradient: 'from-emerald-500 to-teal-500' },
    image: { label: 'Hình ảnh', icon: FileImage, color: 'text-violet-500 bg-violet-500/10', gradient: 'from-violet-500 to-purple-500' },
};

// ===== MOCK DATA =====
const assetsData = [
    { id: 1, name: 'React Hooks - Bài giảng 1.mp4', type: 'video', size: '245 MB', duration: '12:30', usedIn: 2, uploadDate: '20/03/2026', thumbnail: null },
    { id: 2, name: 'Components & Props.mp4', type: 'video', size: '180 MB', duration: '15:20', usedIn: 1, uploadDate: '19/03/2026', thumbnail: null },
    { id: 3, name: 'Hướng dẫn cài đặt.pdf', type: 'document', size: '2.4 MB', duration: '12 trang', usedIn: 3, uploadDate: '18/03/2026', thumbnail: null },
    { id: 4, name: 'Redux Pattern.pdf', type: 'document', size: '1.8 MB', duration: '8 trang', usedIn: 1, uploadDate: '17/03/2026', thumbnail: null },
    { id: 5, name: 'Banner khóa học React.png', type: 'image', size: '850 KB', duration: '1920x1080', usedIn: 1, uploadDate: '16/03/2026', thumbnail: null },
    { id: 6, name: 'useEffect Lifecycle.mp4', type: 'video', size: '320 MB', duration: '25:30', usedIn: 1, uploadDate: '15/03/2026', thumbnail: null },
    { id: 7, name: 'Cheat Sheet React.pdf', type: 'document', size: '560 KB', duration: '4 trang', usedIn: 5, uploadDate: '14/03/2026', thumbnail: null },
    { id: 8, name: 'State Management Diagram.png', type: 'image', size: '420 KB', duration: '1200x800', usedIn: 2, uploadDate: '13/03/2026', thumbnail: null },
    { id: 9, name: 'Context API Deep Dive.mp4', type: 'video', size: '280 MB', duration: '20:15', usedIn: 1, uploadDate: '12/03/2026', thumbnail: null },
];

const storageStats = {
    used: '3.2 GB',
    total: '10 GB',
    percentage: 32,
    videos: '2.8 GB',
    documents: '180 MB',
    images: '220 MB',
};

// ===== MAIN COMPONENT =====
export default function ExpertAssetLibrary() {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const filteredAssets = assetsData.filter(asset => {
        const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all' || asset.type === filterType;
        return matchSearch && matchType;
    });

    const toggleSelectAsset = (id) => {
        setSelectedAssets(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    return (
        <ExpertLayout>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-base-content flex items-center gap-3">
                            <FolderOpen className="w-8 h-8 text-violet-500" />
                            Thư viện Tài nguyên
                        </h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Quản lý và tái sử dụng tài nguyên cho nhiều khóa học
                        </p>
                    </div>
                    <button className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none rounded-xl font-bold shadow-lg shadow-violet-500/25 gap-2">
                        <Upload className="w-4 h-4" />
                        Tải lên
                    </button>
                </motion.div>

                {/* Storage Stats */}
                <motion.div variants={cardVariants} className="bg-base-100 rounded-2xl border border-base-300 shadow-lg p-5 mb-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                <HardDrive className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-base-content/50 font-bold uppercase tracking-wider">Dung lượng</p>
                                <p className="font-black text-base-content">{storageStats.used} / {storageStats.total}</p>
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${storageStats.percentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs">
                            {[
                                { label: 'Video', value: storageStats.videos, color: 'bg-blue-500' },
                                { label: 'Tài liệu', value: storageStats.documents, color: 'bg-emerald-500' },
                                { label: 'Hình ảnh', value: storageStats.images, color: 'bg-violet-500' },
                            ].map(item => (
                                <span key={item.label} className="flex items-center gap-1.5 font-bold text-base-content/70">
                                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                    {item.label}: {item.value}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Toolbar */}
                <motion.div variants={cardVariants} className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {/* Search */}
                    <div className="relative w-full min-w-0 flex-1 sm:min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài nguyên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered w-full pl-10 rounded-xl bg-base-100 text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                    </div>

                    {/* Type Filter */}
                    <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-base-300 bg-base-100 p-1 sm:w-auto">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'video', label: 'Video', icon: Film },
                            { value: 'document', label: 'Tài liệu', icon: FileText },
                            { value: 'image', label: 'Ảnh', icon: FileImage },
                        ].map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setFilterType(filter.value)}
                                className={`btn btn-sm rounded-lg font-bold gap-1 ${filterType === filter.value
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none'
                                    : 'btn-ghost'
                                }`}
                            >
                                {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* View Mode */}
                    <div className="flex w-full gap-1 rounded-xl border border-base-300 bg-base-100 p-1 sm:w-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`btn btn-sm btn-square rounded-lg ${viewMode === 'grid' ? 'bg-base-200' : 'btn-ghost'}`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`btn btn-sm btn-square rounded-lg ${viewMode === 'list' ? 'bg-base-200' : 'btn-ghost'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Drag & Drop Zone */}
                <motion.div
                    variants={cardVariants}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all ${isDragging
                        ? 'border-violet-500 bg-violet-500/5'
                        : 'border-base-300 bg-base-100/50'
                    }`}
                >
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-violet-500' : 'text-base-content/30'}`} />
                    <p className={`text-sm font-bold ${isDragging ? 'text-violet-600' : 'text-base-content/50'}`}>
                        {isDragging ? 'Thả file tại đây!' : 'Kéo thả file vào đây hoặc nhấn nút Tải lên'}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">Hỗ trợ: MP4, PDF, DOCX, PNG, JPG (Tối đa 500MB/file)</p>
                </motion.div>

                {/* Selected Actions Bar */}
                <AnimatePresence>
                    {selectedAssets.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-4 flex items-center justify-between"
                        >
                            <span className="text-sm font-bold text-violet-600">
                                {selectedAssets.length} tài nguyên được chọn
                            </span>
                            <div className="flex gap-2">
                                <button className="btn btn-sm btn-ghost rounded-lg font-bold gap-1">
                                    <Download className="w-3.5 h-3.5" />Tải xuống
                                </button>
                                <button className="btn btn-sm btn-ghost rounded-lg font-bold gap-1 text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />Xóa
                                </button>
                                <button onClick={() => setSelectedAssets([])} className="btn btn-sm btn-ghost btn-circle">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Assets Grid / List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAssets.map((asset, i) => (
                            <AssetGridCard
                                key={asset.id}
                                asset={asset}
                                index={i}
                                isSelected={selectedAssets.includes(asset.id)}
                                onToggleSelect={() => toggleSelectAsset(asset.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-lg">
                        <table className="table table-sm">
                            <thead>
                                <tr className="text-base-content/60">
                                    <th className="font-bold text-xs uppercase w-8"></th>
                                    <th className="font-bold text-xs uppercase">Tên tài nguyên</th>
                                    <th className="font-bold text-xs uppercase">Loại</th>
                                    <th className="font-bold text-xs uppercase">Kích thước</th>
                                    <th className="font-bold text-xs uppercase">Sử dụng</th>
                                    <th className="font-bold text-xs uppercase">Ngày tải</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.map((asset, i) => {
                                    const config = assetTypeConfig[asset.type];
                                    const AssetIcon = config.icon;
                                    return (
                                        <motion.tr
                                            key={asset.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-base-200/50 cursor-pointer"
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssets.includes(asset.id)}
                                                    onChange={() => toggleSelectAsset(asset.id)}
                                                    className="checkbox checkbox-sm checkbox-primary"
                                                />
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                                                        <AssetIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-base-content truncate max-w-[200px]">{asset.name}</p>
                                                        <p className="text-xs text-base-content/50">{asset.duration}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="text-sm font-medium text-base-content/70">{asset.size}</td>
                                            <td>
                                                <span className="text-sm font-bold text-base-content">{asset.usedIn} khóa</span>
                                            </td>
                                            <td className="text-xs text-base-content/50">{asset.uploadDate}</td>
                                            <td>
                                                <button className="btn btn-ghost btn-xs btn-circle">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </ExpertLayout>
    );
}

// ===== GRID CARD =====
function AssetGridCard({ asset, index, isSelected, onToggleSelect }) {
    const config = assetTypeConfig[asset.type];
    const AssetIcon = config.icon;

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -2 }}
            className={`bg-base-100 rounded-2xl border-2 shadow-lg overflow-hidden group transition-all cursor-pointer ${isSelected
                ? 'border-violet-500 shadow-violet-500/10'
                : 'border-base-300 hover:border-violet-500/30 hover:shadow-xl'
            }`}
            onClick={onToggleSelect}
        >
            {/* Thumbnail */}
            <div className={`h-32 bg-gradient-to-br ${config.gradient} bg-opacity-20 flex items-center justify-center relative`}>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AssetIcon className="w-8 h-8 text-white" />
                </div>
                {/* Checkbox */}
                <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected
                        ? 'bg-violet-500 border-violet-500'
                        : 'bg-white/80 border-white/50'
                    }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                </div>
                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="btn btn-xs btn-circle bg-white/80 border-none hover:bg-white" onClick={e => e.stopPropagation()}>
                        <Eye className="w-3 h-3" />
                    </button>
                    <button className="btn btn-xs btn-circle bg-white/80 border-none hover:bg-white" onClick={e => e.stopPropagation()}>
                        <Download className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h4 className="font-bold text-sm text-base-content truncate">{asset.name}</h4>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-base-content/50">{asset.size}</span>
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded">
                        {asset.usedIn} khóa học
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
