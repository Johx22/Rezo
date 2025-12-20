import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Background: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
     // Initial random position
     setPosition({
         x: Math.random() * (window.innerWidth - 800),
         y: Math.random() * (window.innerHeight - 800)
     });
  }, []);

  const handleAnimationComplete = () => {
     setPosition({
         x: Math.random() * (window.innerWidth - 400),
         y: Math.random() * (window.innerHeight - 400)
     });
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Glass overlay to diffuse the blob further and keep content readable */}
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-950/50 backdrop-blur-[80px] z-10 pointer-events-none transition-colors duration-300"></div>
      
      {/* Interactive Gradient Blob 
          Light Mode: Cyan/Blue/Indigo with Multiply Blend
          Dark Mode: Blue/Indigo/Violet with Screen Blend
      */}
      <motion.div
        animate={position}
        transition={{
            duration: 12, // Increased speed (was 20)
            ease: "easeInOut",
        }}
        onAnimationComplete={handleAnimationComplete}
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[100px]
                   opacity-25 dark:opacity-30
                   bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 
                   dark:from-blue-600 dark:via-indigo-600 dark:to-violet-600
                   mix-blend-multiply dark:mix-blend-screen
                   transition-all duration-300"
      />
    </div>
  );
};