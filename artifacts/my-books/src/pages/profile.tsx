import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useAppContext } from "@/lib/app-context";
import { User, Mail, Briefcase, Building2, Lock, Eye, EyeOff, Check, AlertTriangle, Save, Phone, IdCard, Camera } from "lucide-react";

const t = {
  en: {
    profile: "Profile",
    accountInfo: "Account Information",
    accountStatus: "Account Status",
    username: "Username",
    email: "Email",
    fullName: "Full Name",
    jobTitle: "Job Title",
    department: "Department",
    employeeId: "Employee ID",
    phone: "Phone Number",
    password: "Password",
    profilePhoto: "Profile Photo",
    uploadPhoto: "Upload Photo",
    updateProfile: "Update Account",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    passwordUpdated: "Password updated successfully!",
    profileUpdated: "Profile updated successfully!",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 4 characters.",
    fillAllFields: "Please fill all required fields.",
  },
  ar: {
    profile: "بروفايل",
    accountInfo: "معلومات الحساب",
    accountStatus: "حالة الحساب",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    fullName: "الاسم الكامل",
    jobTitle: "المسمى الوظيفي",
    department: "القسم",
    employeeId: "رقم الموظف",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    profilePhoto: "صورة البروفايل",
    uploadPhoto: "رفع الصورة",
    updateProfile: "تحديث الحساب",
    changePassword: "تغيير كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور",
    passwordUpdated: "تم تحديث كلمة المرور بنجاح!",
    profileUpdated: "تم تحديث البيانات بنجاح!",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    passwordTooShort: "يجب أن تكون كلمة المرور 4 أحرف على الأقل.",
    fillAllFields: "يرجى ملء جميع الحقول المطلوبة.",
  },
};

export function Profile() {
  const { user, updateUser } = useAuth();
  const { lang } = useAppContext();
  const [activeTab, setActiveTab] = useState<"info" | "status">("info");
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFullName(user.fullName || "");
      setJobTitle(user.jobTitle || "");
      setDepartment(user.department || "");
      setEmployeeId(user.employeeId || "");
      setPhone(user.phone || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const txt = t[lang];
  const isRtl = lang === "ar";

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (!fullName || !email) {
      setError(txt.fillAllFields);
      return;
    }

    const updates: any = {
      email,
      fullName,
      jobTitle,
      department,
      employeeId,
      phone,
    };

    if (avatarUrl) {
      updates.avatarUrl = avatarUrl;
    }

    await updateUser(updates);
    setSuccess(txt.profileUpdated);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const updates: any = {};
    let hasChanges = false;

    // Update username if changed
    if (username) {
      updates.username = username;
      hasChanges = true;
    }

    // Check if user wants to update password
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        setError(txt.fillAllFields);
        return;
      }
      if (newPassword.length < 4) {
        setError(txt.passwordTooShort);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(txt.passwordsDoNotMatch);
        return;
      }
      updates.password = newPassword;
      hasChanges = true;
    }

    if (!hasChanges) {
      setError(txt.fillAllFields);
      return;
    }

    await updateUser(updates);
    setSuccess(txt.profileUpdated);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="p-4 sm:p-8 text-white bg-background flex-1 overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-bold mb-8 text-foreground">{txt.profile}</h1>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg max-w-2xl mx-auto overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 px-6 py-4 font-bold text-sm transition-colors ${
              activeTab === "info"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {txt.accountInfo}
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`flex-1 px-6 py-4 font-bold text-sm transition-colors ${
              activeTab === "status"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {txt.accountStatus}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Account Information Tab */}
          {activeTab === "info" && (
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-2 border-primary" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                      <User size={48} className="text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 rounded-full p-2 shadow-lg transition-colors"
                    title={txt.uploadPhoto}
                    aria-label={txt.uploadPhoto}
                  >
                    <Camera size={20} className="text-primary-foreground" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label={txt.profilePhoto}
                />
                <p className="text-xs text-muted-foreground">{txt.profilePhoto}</p>
              </div>

              {/* Full Name */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <User size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={txt.fullName}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Mail size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="email"
                  placeholder={txt.email}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Job Title */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Briefcase size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={txt.jobTitle}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Building2 size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={txt.department}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* Employee ID */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <IdCard size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={txt.employeeId}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Phone size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="tel"
                  placeholder={txt.phone}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {error && <div className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle size={16} /><span>{error}</span></div>}
              {success && <div className="flex items-center gap-2 text-sm text-green-500"><Check size={16} /><span>{success}</span></div>}

              {/* Update Button */}
              <div className="pt-4">
                <button type="submit" className="w-full rounded-lg bg-primary px-8 py-3 text-sm font-bold tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Save size={16} />
                  {txt.updateProfile}
                </button>
              </div>
            </form>
          )}

          {/* Account Status Tab */}
          {activeTab === "status" && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Username */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <User size={17} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={txt.username}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Current Password */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Lock size={17} className="text-muted-foreground shrink-0" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder={txt.password}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {currentPassword && (
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="text-muted-foreground hover:text-foreground">
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-white/10"></div>

              {/* New Password */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Lock size={17} className="text-muted-foreground shrink-0" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder={txt.newPassword}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPassword && (
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-muted-foreground hover:text-foreground">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="relative flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-primary transition-colors">
                <Lock size={17} className="text-muted-foreground shrink-0" />
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={txt.confirmNewPassword} 
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tracking-widest" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                {confirmPassword && (
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>

              {error && <div className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle size={16} /><span>{error}</span></div>}
              {success && <div className="flex items-center gap-2 text-sm text-green-500"><Check size={16} /><span>{success}</span></div>}

              {/* Update Button */}
              <div className="pt-4">
                <button type="submit" className="w-full rounded-lg bg-primary px-8 py-3 text-sm font-bold tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Save size={16} />
                  {txt.updateProfile}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}