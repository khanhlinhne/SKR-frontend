import { motion } from 'motion/react';
import { User as UserIcon, Save } from 'lucide-react';

export default function ProfilePersonalInfoCard({ userData, isEditing, saving, onSave, onChangeField, variants }) {
    return (
        <motion.div variants={variants} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-black text-base-content">
                    <UserIcon className="h-5 w-5" />
                    Thông tin cá nhân
                </h2>
                {isEditing && (
                    <button className="btn btn-primary btn-sm rounded-xl font-bold" onClick={onSave} disabled={saving}>
                        <Save className="h-4 w-4" />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                    label="Họ và tên"
                    value={userData.name}
                    disabled={!isEditing}
                    onChange={(value) => onChangeField('name', value)}
                />
                <Field
                    label="Email"
                    type="email"
                    value={userData.email}
                    disabled={!isEditing}
                    onChange={(value) => onChangeField('email', value)}
                />
                <Field
                    label="Số điện thoại"
                    type="tel"
                    value={userData.phone}
                    disabled={!isEditing}
                    onChange={(value) => onChangeField('phone', value)}
                />
                <Field
                    label="Địa chỉ"
                    value={userData.location}
                    disabled={!isEditing}
                    onChange={(value) => onChangeField('location', value)}
                />
                <div className="form-control md:col-span-2">
                    <label className="label">
                        <span className="label-text font-bold">Giới thiệu bản thân</span>
                    </label>
                    <textarea
                        value={userData.bio}
                        disabled={!isEditing}
                        className="textarea textarea-bordered h-24 rounded-xl font-medium"
                        onChange={(event) => onChangeField('bio', event.target.value)}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function Field({ label, type = 'text', value, disabled, onChange }) {
    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text font-bold">{label}</span>
            </label>
            <input
                type={type}
                value={value}
                disabled={disabled}
                className="input input-bordered rounded-xl font-medium"
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
