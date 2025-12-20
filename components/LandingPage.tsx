import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // State for animated gradient blobs
  const [blob1Pos, setBlob1Pos] = useState({ x: 0, y: 0 });
  const [blob2Pos, setBlob2Pos] = useState({ x: 0, y: 0 });

  useEffect(() => {
     // Initial positions
     setBlob1Pos({ x: Math.random() * (window.innerWidth / 2), y: Math.random() * (window.innerHeight / 2) });
     setBlob2Pos({ x: Math.random() * (window.innerWidth / 2) + window.innerWidth/2 - 400, y: Math.random() * (window.innerHeight / 2) + window.innerHeight/2 - 400 });
  }, []);

  const moveBlob1 = () => {
      setBlob1Pos({ 
          x: Math.random() * (window.innerWidth - 500), 
          y: Math.random() * (window.innerHeight - 500) 
      });
  };

  const moveBlob2 = () => {
      setBlob2Pos({ 
          x: Math.random() * (window.innerWidth - 500), 
          y: Math.random() * (window.innerHeight - 500) 
      });
  };

  return (
    <div className="relative h-screen w-full bg-slate-950 overflow-hidden text-white flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* Gradient Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Blob 1 - Blue/Indigo */}
          <motion.div
            animate={blob1Pos}
            transition={{ duration: 20, ease: "easeInOut" }}
            onAnimationComplete={moveBlob1}
            className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-30
                       bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500
                       mix-blend-screen"
          />
          
          {/* Blob 2 - Cyan/Teal (offset) */}
          <motion.div
            animate={blob2Pos}
            transition={{ duration: 25, ease: "easeInOut" }}
            onAnimationComplete={moveBlob2}
            className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-20
                       bg-gradient-to-l from-cyan-500 via-teal-500 to-emerald-500
                       mix-blend-screen"
          />
          
          {/* Noise overlay for texture */}
          <div className="absolute inset-0 opacity-20 brightness-100 contrast-150 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Starry Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
            <Star key={i} />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 lg:px-8 flex items-center">
         <div className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <text x="2" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="30" className="fill-blue-500">R</text>
                <circle cx="27" cy="24" r="3.5" className="fill-white" />
            </svg>
            <span className="font-bold text-2xl tracking-tight text-white">Rezo</span>
         </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
        >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-10 leading-tight tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                Because your<br />resume matters.
            </h1>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-6"
        >
            <button
                onClick={onStart}
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg flex items-center gap-3 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            >
                Create Resume
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Yes it's free. No Signup.</p>
                <p className="text-slate-500 text-xs">Made with <span className="text-red-500 inline-block animate-pulse">♥</span> by Johann</p>
            </div>
        </motion.div>
      </main>
    </div>
  );
};

const Star = () => {
    // Generate random starting positions
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    
    // Generate random movement destination relative to start
    const moveX = (Math.random() - 0.5) * 100; // -50 to 50
    const moveY = (Math.random() - 0.5) * 100; 

    const size = Math.random() * 2 + 1; // 1 to 3px
    const duration = Math.random() * 20 + 10; // 10 to 30s

    return (
        <motion.div
            className="absolute rounded-full bg-white"
            style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
                x: [0, moveX],
                y: [0, moveY],
                opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
            }}
        />
    );
};