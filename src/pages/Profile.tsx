import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/c32cc640-cfbc-4ef9-a593-fbd618bb2e63";
const ADMIN_ID = "620899";

function getLocalProfile() {
  const stored = localStorage.getItem("user_profile");
  if (stored) {
    const p = JSON.parse(stored);
    if (!p.id) {
      p.id = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem("user_profile", JSON.stringify(p));
    }
    return p;
  }
  const fresh = { nickname: "", balance: 100, privileges: [], avatar: "", id: String(Math.floor(100000 + Math.random() * 900000)) };
  localStorage.setItem("user_profile", JSON.stringify(fresh));
  return fresh;
}

interface UserProfile {
  id: string;
  nickname: string;
  balance: number;
  privileges: string[];
  avatar: string;
}

async function syncProfile(p: UserProfile) {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "upsert", ...p }),
  });
}

async function fetchProfile(id: string): Promise<UserProfile | null> {
  const res = await fetch(`${API}?id=${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getLocalProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.nickname);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Панель админа
  const [transferId, setTransferId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMsg, setTransferMsg] = useState("");

  const isAdmin = profile.id === ADMIN_ID;

  useEffect(() => {
    fetchProfile(profile.id).then((server) => {
      if (server) {
        const merged = { ...profile, balance: server.balance, privileges: server.privileges };
        setProfile(merged);
        localStorage.setItem("user_profile", JSON.stringify(merged));
      } else {
        syncProfile(profile);
      }
    });
  }, []);

  const save = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem("user_profile", JSON.stringify(updated));
    syncProfile(updated);
  };

  const saveNickname = () => {
    save({ ...profile, nickname: draft.trim() || "Гость" });
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => save({ ...profile, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleTransfer = async () => {
    setTransferMsg("");
    const amount = parseInt(transferAmount);
    if (!transferId || !amount || amount <= 0) { setTransferMsg("Введи ID и сумму"); return; }
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "transfer", from_id: profile.id, to_id: transferId, amount }),
    });
    const data = await res.json();
    if (data.ok) {
      setTransferMsg(`✓ Отправлено ${amount} 💠 участнику ${transferId}`);
      setTransferId("");
      setTransferAmount("");
    } else {
      setTransferMsg(`Ошибка: ${data.error}`);
    }
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
            className="relative w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold cursor-pointer group overflow-hidden"
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
            <div className="text-white/30 text-xs tracking-widest mt-1">ID: {profile.id}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Статус</span>
              <span className="border border-white/20 text-white/50 text-xs uppercase tracking-widest px-3 py-1">
                {isAdmin ? "Администратор" : "Стандарт"}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-white/40 text-sm mb-1">Баланс</div>
            <div className="text-2xl font-bold">{profile.balance} 💠</div>
          </div>
        </motion.div>

        {/* Панель администратора */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="border border-yellow-500/30 bg-yellow-500/5 p-6 mb-8"
          >
            <div className="text-xs uppercase tracking-[0.4em] text-yellow-500/60 mb-4">Панель администратора</div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={transferId}
                onChange={(e) => setTransferId(e.target.value)}
                placeholder="ID участника"
                className="bg-transparent border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none flex-1"
              />
              <input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Сумма 💠"
                type="number"
                className="bg-transparent border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none w-32"
              />
              <button
                onClick={handleTransfer}
                className="bg-yellow-500 text-black text-sm uppercase tracking-widest px-6 py-2 hover:bg-yellow-400 transition-colors cursor-pointer"
              >
                Отправить
              </button>
            </div>
            {transferMsg && (
              <div className="mt-3 text-sm text-yellow-400/80">{transferMsg}</div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="border border-white/10 p-6 mb-8"
        >
          <div className="text-xs uppercase tracking-[0.4em] text-white/30 mb-4">Мои покупки</div>
          {profile.privileges.length === 0 ? (
            <div className="text-white/20 text-sm">Покупок пока нет — купи первую привилегию на главной</div>
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
            <div className="text-2xl font-bold">{isAdmin ? "Админ" : "Стандарт"}</div>
            <div className="text-white/40 text-xs uppercase tracking-widest mt-1">Уровень</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}