import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";


export default function Profile() {
  const navigate = useNavigate();

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
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold">
            М
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Макс</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Статус</span>
              <span className="border border-white/20 text-white text-xs uppercase tracking-widest px-3 py-1">
                VIP
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
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-4 border-t border-white/10 pt-10 grid grid-cols-2 gap-6 text-center"
        >
          <div>
            <div className="text-2xl font-bold">1</div>
            <div className="text-white/40 text-xs uppercase tracking-widest mt-1">Привилегии</div>
          </div>
          <div>
            <div className="text-2xl font-bold">VIP</div>
            <div className="text-white/40 text-xs uppercase tracking-widest mt-1">Уровень</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}