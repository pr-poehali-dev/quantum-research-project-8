import Header from "@/components/Header";
import Hero from "@/components/Hero";

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <div className="bg-black border-t border-white/10 py-4 text-center">
        <span className="text-white/30 text-xs uppercase tracking-widest">Поддержка</span>
        <a
          href="tel:+79885514364"
          className="ml-3 text-white/60 hover:text-white transition-colors duration-300 text-sm tracking-wide"
        >
          +7 988 551 43 64
        </a>
      </div>
    </main>
  );
};

export default Index;