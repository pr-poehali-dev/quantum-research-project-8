import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

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
      className="relative flex items-center justify-center h-screen overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full bg-black" />

      <motion.div style={{ y }} className="relative z-10 text-center text-white flex flex-col items-center">
        <div className="text-[20vw] md:text-[18vw] lg:text-[16vw] font-bold tracking-tight leading-none select-none">
          М
        </div>
        <p className="text-lg md:text-xl max-w-2xl mx-auto px-6 opacity-60 uppercase tracking-[0.4em] mt-4">
          Privilège
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-6 text-left min-w-[280px]"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3">Статус</div>
          <div className="text-2xl font-bold tracking-wide mb-1">VIP</div>
          <div className="text-white/40 text-sm mb-6">Привилегия · Эксклюзивный доступ</div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-white/50 text-sm">Стоимость</span>
            <span className="text-xl font-bold">100 💠</span>
          </div>
          <button className="mt-5 w-full bg-white text-black text-sm uppercase tracking-widest py-3 hover:bg-white/80 transition-colors duration-300 cursor-pointer">
            Получить
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}