import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AUTH_URL = "https://functions.poehali.dev/db41b4b7-6f6a-4f4f-8b9b-ccec04769a7e";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = { action: mode, username, password };
      if (mode === "register") body.nickname = nickname || username;

      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Ошибка");
        setLoading(false);
        return;
      }

      localStorage.setItem("user_profile", JSON.stringify({
        id: data.id,
        username: data.username,
        nickname: data.nickname,
        balance: data.balance,
        privileges: data.privileges,
        avatar: data.avatar,
        is_admin: data.is_admin,
        token: data.token,
      }));

      navigate("/");
    } catch {
      setError("Нет соединения с сервером");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="text-5xl font-bold tracking-tight mb-2">М</div>
          <div className="text-xs uppercase tracking-[0.4em] text-white/40">Privilège</div>
        </div>

        <div className="flex border border-white/10 mb-8">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors cursor-pointer ${mode === "login" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
          >
            Войти
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors cursor-pointer ${mode === "register" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
          >
            Регистрация
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Логин</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="username"
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Никнейм</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Как тебя звать?"
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-white/50 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-black text-sm uppercase tracking-widest py-3 hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
