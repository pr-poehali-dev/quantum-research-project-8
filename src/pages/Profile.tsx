import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

function getProfile() {
  const stored = localStorage.getItem("user_profile");
  if (stored) return JSON.parse(stored);
  const fresh = { nickname: "", balance: 100, privileges: [], avatar: "" };
  localStorage.setItem("user_profile", JSON.stringify(fresh));
  return fresh;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.nickname);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveNickname = () => {
    const updated = { ...profile, nickname: draft.trim() || "Гость" };
    setProfile(updated);
    localStorage.setItem("user_profile", JSON.stringify(updated));
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...profile, avatar: reader.result as string };
      setProfile(updated);
      localStorage.setItem("user_profile", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const displayName = profile.nickname || "Гость";
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 text-sm uppercase tracking-wide"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>
        <div className="text-sm uppercase tracking-[0.3em] text-white/40">Privilège</div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 mb-16"
        >
          <div
            className="relative w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold cursor-pointer group overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{avatarLetter}</span>
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
              <Icon name="Camera" size={18} className="text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            {editing ? (
              <div className="flex items-center gap-3">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveNickname()}
                  placeholder="Введи ник..."
                  className="bg-transparent border-b border-white/40 text-2xl font-bold tracking-tight outline-none text-white placeholder:text-white/20 w-48"
                />
                <button onClick={saveNickname} className="text-white/50 hover:text-white transition-colors">
                  <Icon name="Check" size={18} />
                </button>
                <button onClick={() => setEditing(false)} className="text-white/30 hover:text-white transition-colors">
                  <Icon name="X" size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setDraft(profile.nickname); setEditing(true); }}>
                <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                <Icon name="Pencil" size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Статус</span>
              <span className="border border-white/20 text-white/50 text-xs uppercase tracking-widest px-3 py-1">
                Стандарт
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-white/40 text-sm mb-1">Баланс</div>
            <div className="text-2xl font-bold">100 💠</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="border border-white/10 p-6 mb-8"
        >
          <div className="text-xs uppercase tracking-[0.4em] text-white/30 mb-4">Мои привилегии</div>
          {profile.privileges.length === 0 ? (
            <div className="text-white/20 text-sm">Привилегий пока нет — купи первую на главной</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {profile.privileges.map((p: string, i: number) => (
                <span key={i} className="border border-white/20 text-white text-xs uppercase tracking-widest px-3 py-1">{p}</span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-white/10 pt-10 grid grid-cols-2 gap-6 text-center"
        >
          <div>
            <div className="text-2xl font-bold">{profile.privileges.length}</div>
            <div className="text-white/40 text-xs uppercase tracking-widest mt-1">Привилегии</div>
          </div>
          <div>
            <div className="text-2xl font-bold">Стандарт</div>
            <div className="text-white/40 text-xs uppercase tracking-widest mt-1">Уровень</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}