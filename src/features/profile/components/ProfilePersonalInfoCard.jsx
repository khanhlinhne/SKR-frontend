import { motion } from 'motion/react';
import { User as UserIcon, Save } from 'lucide-react';

export default function ProfilePersonalInfoCard({ userData, isEditing, saving, onSave, onChangeField, variants }) {
    return (
        <motion.div
            variants={variants}
            className="bg-base-100 rounded-3xl p-6 shadow-lg border border-base-300"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Thong Tin Ca Nhan
                </h2>
                {isEditing && (
                    <button
                        className="btn btn-sm btn-primary rounded-xl font-bold"
                        onClick={onSave}
                        disabled={saving}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Dang luu...' : 'Luu thay doi'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-bold">Ho va ten</span>
                    </label>
                    <input
                        type="text"
                        value={userData.name}
                        disabled={!isEditing}
                        className="input input-bordered rounded-xl font-medium"
                        onChange={(e) => onChangeField('name', e.target.value)}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-bold">Email</span>
                    </label>
                    <input
                        type="email"
                        value={userData.email}
                        disabled={!isEditing}
                        className="input input-bordered rounded-xl font-medium"
                        onChange={(e) => onChangeField('email', e.target.value)}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-bold">So dien thoai</span>
                    </label>
                    <input
                        type="tel"
                        value={userData.phone}
                        disabled={!isEditing}
                        className="input input-bordered rounded-xl font-medium"
                        onChange={(e) => onChangeField('phone', e.target.value)}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-bold">Dia chi</span>
                    </label>
                    <input
                        type="text"
                        value={userData.location}
                        disabled={!isEditing}
                        className="input input-bordered rounded-xl font-medium"
                        onChange={(e) => onChangeField('location', e.target.value)}
                    />
                </div>

                <div className="form-control md:col-span-2">
                    <label className="label">
                        <span className="label-text font-bold">Gioi thieu ban than</span>
                    </label>
                    <textarea
                        value={userData.bio}
                        disabled={!isEditing}
                        className="textarea textarea-bordered rounded-xl font-medium h-24"
                        onChange={(e) => onChangeField('bio', e.target.value)}
                    />
                </div>
            </div>
        </motion.div>
    );
}
