import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, useState } from "react";

function getProfile() {
  const stored = localStorage.getItem("user_profile");
  if (stored) return JSON.parse(stored);
  const fresh = { nickname: "", balance: 100, privileges: [], avatar: "" };
  localStorage.setItem("user_profile", JSON.stringify(fresh));
  return fresh;
}

const ITEMS = [
  { key: "VIP", label: "VIP", desc: "Привилегия · Эксклюзивный доступ", price: 100 },
  { key: "VIP+", label: "VIP +", desc: "Максимальный статус · Все привилегии", price: 500 },
];

function ShopCard({ item }: { item: typeof ITEMS[0] }) {
  const [status, setStatus] = useState<"idle" | "success" | "already" | "broke">(() => {
    const p = getProfile();
    return p.privileges?.includes(item.key) ? "already" : "idle";
  });
  const [balance, setBalance] = useState(() => getProfile().balance);

  const handleBuy = () => {
    const profile = getProfile();
    if (profile.privileges?.includes(item.key)) { setStatus("already"); return; }
    if (profile.balance < item.price) { setStatus("broke"); return; }
    const updated = {
      ...profile,
      balance: profile.balance - item.price,
      privileges: [...(profile.privileges || []), item.key],
    };
    localStorage.setItem("user_profile", JSON.stringify(updated));
    setBalance(updated.balance);
    setStatus("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-6 text-left min-w-[280px]"
    >
      <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3">Статус</div>
      <div className="text-2xl font-bold tracking-wide mb-1">{item.label}</div>
      <div className="text-white/40 text-sm mb-6">{item.desc}</div>
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-white/50 text-sm">Стоимость</span>
        <span className="text-xl font-bold">{item.price} 💠</span>
      </div>

      {status === "success" && (
        <div className="mt-4 text-green-400 text-sm text-center uppercase tracking-widest">{item.label} получен! Баланс: {balance} 💠</div>
      )}
      {status === "already" && (
        <div className="mt-4 text-white/40 text-sm text-center uppercase tracking-widest">Уже куплено</div>
      )}
      {status === "broke" && (
        <div className="mt-4 text-red-400 text-sm text-center uppercase tracking-widest">Недостаточно 💠</div>
      )}

      <button
        onClick={status === "idle" || status === "broke" ? handleBuy : undefined}
        disabled={status === "success" || status === "already"}
        className={`mt-5 w-full text-sm uppercase tracking-widest py-3 transition-colors duration-300 ${
          status === "success" || status === "already"
            ? "bg-white/10 text-white/30 cursor-not-allowed"
            : "bg-white text-black hover:bg-white/80 cursor-pointer"
        }`}
      >
        Получить
      </button>
    </motion.div>
  );
}

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center min-h-screen overflow-hidden py-20"
    >
      <div className="absolute inset-0 w-full h-full bg-black" />

      <motion.div style={{ y }} className="relative z-10 text-center text-white flex flex-col items-center">
        <div className="text-[20vw] md:text-[18vw] lg:text-[16vw] font-bold tracking-tight leading-none select-none">
          М
        </div>
        <p className="text-lg md:text-xl max-w-2xl mx-auto px-6 opacity-60 uppercase tracking-[0.4em] mt-4 mb-10">
          Privilège
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {ITEMS.map((item) => (
            <ShopCard key={item.key} item={item} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
