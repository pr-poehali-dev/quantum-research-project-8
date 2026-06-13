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
      </motion.div>
    </div>
  );
}