import React, { useState, useRef } from "react";
import { useAppContext } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Briefcase, Building, Key, Camera, XCircle } from "lucide-react";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  onChange: (v: string) => void;
  onClear?: () => void;
  editable?: boolean;
  type?: "text" | "email" | "tel";
}

function ProfileField({ id, label, value, icon, onChange, onClear, editable = true, type = "text" }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={label}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!editable}
          className={`w-full rounded-lg border bg-card py-2.5 pl-9 pr-8 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${!editable ? "text-muted-foreground" : ""}`}
        />
        {editable && onClear && value.length > 0 && (
          <button type="button" onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={`Clear ${label}`}>
            <XCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function PhoneProfile() {
  const { lang } = useAppContext();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const [formData, setFormData] = useState({
    fullName: user.fullName || user.username || "",
    jobTitle: user.jobTitle || "",
    department: user.department || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [avatar, setAvatar] = useState(user.avatarUrl);

  const t = {
    title: lang === "ar" ? "الملف الشخصي" : "User Profile",
    subtitle: lang === "ar" ? "إدارة معلومات حسابك" : "Manage your account information",
    fullName: lang === "ar" ? "الاسم الكامل" : "Full Name",
    employeeId: lang === "ar" ? "الرقم الوظيفي" : "Employee ID",
    jobTitle: lang === "ar" ? "المسمى الوظيفي" : "Job Title",
    department: lang === "ar" ? "القسم" : "Department",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    phone: lang === "ar" ? "رقم الهاتف" : "Phone Number",
    changePhoto: lang === "ar" ? "تغيير الصورة" : "Change Photo",
    save: lang === "ar" ? "حفظ التغييرات" : "Save Changes",
    saved: lang === "ar" ? "تم الحفظ" : "Saved",
  };

  const handleSave = () => {
    updateUser({ ...formData, avatarUrl: avatar });
    toast({ title: t.saved });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAvatarUrl = URL.createObjectURL(file);
      setAvatar(newAvatarUrl);
    }
  };

  return (
    <div className="p-4 pb-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="relative">
          <img
            src={avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-card shadow-md"
          />
          <label
            htmlFor="photo-upload"
            aria-label={t.changePhoto}
            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background"
          >
            <Camera size={14} />
          </label>
          <input ref={fileInputRef} id="photo-upload" type="file" className="hidden" accept="image/*" aria-label={t.changePhoto} title={t.changePhoto} onChange={handlePhotoChange} />
        </div>
        <h2 className="text-lg font-bold text-foreground">{formData.fullName}</h2>
        <p className="text-sm text-muted-foreground">{user.username}</p>
      </div>

      {/* Fields Section */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <ProfileField id="fullName" label={t.fullName} value={formData.fullName} icon={<User size={16} />} onChange={(v) => setFormData({ ...formData, fullName: v })} onClear={() => setFormData({ ...formData, fullName: "" })} />
          <ProfileField id="employeeId" label={t.employeeId} value={user.employeeId || ""} icon={<Key size={16} />} onChange={() => {}} editable={false} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ProfileField id="jobTitle" label={t.jobTitle} value={formData.jobTitle} icon={<Briefcase size={16} />} onChange={(v) => setFormData({ ...formData, jobTitle: v })} onClear={() => setFormData({ ...formData, jobTitle: "" })} />
          <ProfileField id="department" label={t.department} value={formData.department} icon={<Building size={16} />} onChange={(v) => setFormData({ ...formData, department: v })} onClear={() => setFormData({ ...formData, department: "" })} />
        </div>
        <ProfileField id="email" label={t.email} value={formData.email} icon={<Mail size={16} />} onChange={(v) => setFormData({ ...formData, email: v })} onClear={() => setFormData({ ...formData, email: "" })} type="email" />
        <ProfileField id="phone" label={t.phone} value={formData.phone} icon={<Phone size={16} />} onChange={(v) => setFormData({ ...formData, phone: v })} onClear={() => setFormData({ ...formData, phone: "" })} type="tel" />
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
      >
        {t.save}
      </button>
    </div>
  );
}